import React from 'react'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
<<<<<<< HEAD

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
    throw new Error(`Network should be ${network.networkId}`)
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
      resolve(listingId)
    })
  })

  return listingId
}
=======
import { createListing } from 'utils/listing'
>>>>>>> master

const CreateListing = ({
  className,
  children,
  onCreated = () => {},
  onError
}) => {
  const { config } = useConfig()
  const [{ admin }] = useStateValue()
  return (
    <button
      type="button"
      className={className}
      onClick={e => {
        e.preventDefault()
        createListing({ config, network: admin.network })
          .then(onCreated)
          .catch(err => onError(err.message))
      }}
      children={children}
    />
  )
}

export default CreateListing
