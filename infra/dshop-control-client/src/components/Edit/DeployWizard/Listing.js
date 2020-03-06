import React, { useEffect, useState } from 'react'
import { useStoreState } from 'pullstate'
import { ethers } from 'ethers'
import bs58 from 'bs58'
import ipfsClient from 'ipfs-http-client'

import { baseListing } from '@/constants'
import Loading from 'components/Loading'
import contracts from '@/constants/contracts'
import MetaMaskCallToAction from './MetaMaskCallToAction'
import store from '@/store'

const Listing = ({ ethNetworkId }) => {
  const [loading, setLoading] = useState(false)
  const settings = useStoreState(store, s => s.settings)

  const config = contracts[ethNetworkId]

  useEffect(() => {
    createListing()
  }, [])

  /* Create a listing on the Origin Marketplace contract
   *
   */
  const createListing = async () => {
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

    setLoading(true)

    // Wait for ListingCreated event to get listingID
    // Event filter for ListingCreated event with the same IPFS hash, ignore other
    // parameters
    const eventFilter = marketplaceContract.filters.ListingCreated(
      signer._address,
      null,
      null
    )

    const listingId = await new Promise(resolve => {
      marketplaceContract.on(eventFilter, (party, listingId, ipfsHash) => {
        console.debug(`Created listing ${listingId} ${ipfsHash}`)
        resolve(`${ethNetworkId}-001-${Number(listingId)}`)
      })
    })

    store.update(s => {
      s.settings = {
        ...s.settings,
        networks: {
          ...s.settings.networks,
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
    })

    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="metamask-prompt">
      <div>
        <MetaMaskCallToAction />
        <p className="mt-3">
          <strong>Creating a listing on the Origin Marketplace</strong>
        </p>
        <p>
          Sign your configuration using MetaMask to complete the DShop creation
          process.
        </p>
      </div>
    </div>
  )
}

export default Listing

require('react-styl')(`
.metamask-prompt
  text-align: center;
  padding: 4rem 0;
`)
