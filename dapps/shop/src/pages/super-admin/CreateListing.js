import React from 'react'
import ethers from 'ethers'
import { post } from '@origin/ipfs'
import { useStateValue } from 'data/state'

import useConfig from 'utils/useConfig'

const abi = [
  'function createListing(bytes32, uint256, address)',
  'event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash)'
]

const baseListing = {
  __typename: 'UnitListing',
  schemaId: 'https://schema.originprotocol.com/listing_3.0.0.json',
  listingType: 'unit',
  category: 'schema.forSale',
  subCategory: 'schema.clothingAccessories',
  language: 'en-US',
  description: 'Origin DShop Store',
  media: [],
  price: { amount: '0', currency: 'fiat-USD' },
  amount: '0',
  currency: 'fiat-USD',
  acceptedTokens: ['token-ETH'],
  commission: { currency: 'OGN', amount: '0' },
  commissionPerUnit: { currency: 'OGN', amount: '0' },
  requiresShipping: false,
  unitsTotal: 1000
}

async function createListing({ title, network }) {
  const enabled = await window.ethereum.enable()
  if (!enabled) {
    return
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const providerNetwork = await provider.getNetwork()
  if (providerNetwork.chainId !== network.networkId) {
    console.log(`Network should be ${network.networkId}`)
    return
  }

  const signer = provider.getSigner()
  const address = await signer.getAddress()

  const bytes32Hash = await post(network.ipfsApi, { ...baseListing, title })
  const contract = new ethers.Contract(network.marketplaceContract, abi, signer)

  const tx = await contract.createListing(bytes32Hash, 0, address)
  await tx.wait()

  const listingId = await new Promise(resolve => {
    const eventFilter = contract.filters.ListingCreated(address, null, null)
    contract.on(eventFilter, (party, listingId) => {
      const { networkId, marketplaceVersion } = network
      resolve(`${networkId}-${marketplaceVersion}-${Number(listingId)}`)
    })
  })

  return listingId
}

const CreateListing = ({ className, children, onCreated = () => {} }) => {
  const { config } = useConfig()
  const [{ admin }] = useStateValue()
  return (
    <button
      className={className}
      onClick={e => {
        e.preventDefault()
        createListing({ config, network: admin.network }).then(onCreated)
      }}
      children={children}
    />
  )
}

export default CreateListing
