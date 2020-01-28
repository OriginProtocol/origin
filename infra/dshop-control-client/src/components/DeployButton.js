import React, { useState } from 'react'
import ipfsClient from 'ipfs-http-client'
import axios from 'axios'
import { useStoreState } from 'pullstate'
import { ethers } from 'ethers'
import bs58 from 'bs58'
import { get } from 'lodash'

import contracts from '@/constants/contracts'
import store from '@/store'
import { baseListing } from '@/constants'

const API_URL = process.env.API_URL || 'http://localhost:3000'

const DeployButton = () => {
  const [loading, setLoading] = useState(false)
  const settings = useStoreState(store, s => s.settings)
  const collections = useStoreState(store, s => s.collections)
  const products = useStoreState(store, s => s.products)
  const ethNetworkId = Number(web3.currentProvider.chainId)
  const config = contracts[ethNetworkId]

  const onDeploy = async () => {
    setLoading(true)

    let listingId = get(settings.networks, `${ethNetworkId}.listingId`)
    if (!listingId) {
      listingId = await _createListing()
    }

    const _settings = {
      ...settings,
      networks: {
        ...settings.networks,
        [ethNetworkId]: {
          marketplaceContract: config['Marketplace_V01'],
          listingId,
          affiliate: '',
          arbitrator: config.arbitrator,
          ipfsGateway: config.ipfsGateway,
          ipfsApi: config.ipfsApi
        }
      }
    }

    store.update(s => {
      return {
        ...s,
        settings: _settings
      }
    })

    // Update IPFS
    const response = await axios.post(`${API_URL}/deploy`, {
      settings: _settings,
      collections,
      products
    })

    // TODO replace with a success message/modal
    window.open(
      `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.data}`,
      '_blank'
    )

    setLoading(false)
  }

  const _createListing = async () => {
    if (!config) {
      console.error(`No configuration for network`, ethNetworkId)
      return
    }

    if (!window.ethereum) return
    await window.ethereum.enable()
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const ipfs = ipfsClient(process.env.IPFS_API_URL)

    const signer = provider.getSigner(0)
    const abi = [
      'event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash)',
      'function createListing(bytes32, uint256, address)'
    ]
    const marketplaceContract = new ethers.Contract(
      config['Marketplace_V01'],
      abi,
      signer
    )
    const listing = {
      ...baseListing,
      title: settings.title,
      description: settings.title
    }

    const response = await ipfs.add(Buffer.from(JSON.stringify(listing)))
    const bytes32Hash = `0x${bs58
      .decode(response[0].hash)
      .slice(2)
      .toString('hex')}`
    await marketplaceContract.createListing(bytes32Hash, 0, config.arbitrator)

    // Wait for ListingCreated event to get listingID
    // Event filter for ListingCreated event with the same IPFS hash, ignore other
    // parameters
    const eventFilter = marketplaceContract.filters.ListingCreated(
      signer._address,
      null,
      null
    )

    const eventPromise = new Promise(resolve => {
      marketplaceContract.on(eventFilter, (party, listingId, ipfsHash) => {
        console.debug(`Created listing ${listingId} ${ipfsHash}`)
        resolve(`${ethNetworkId}-001-${Number(listingId)}`)
      })
    })

    return eventPromise
  }

  return (
    <button
      className="btn btn-lg btn-dark btn-block"
      onClick={onDeploy}
      disabled={loading}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span className="sr-only">Deploying...</span>
        </>
      ) : (
        'Deploy'
      )}
    </button>
  )
}

export default DeployButton
