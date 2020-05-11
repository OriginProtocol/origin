import React, { useState } from 'react'
import ethers from 'ethers'

import { get, post, getIpfsHashFromBytes32 } from '@origin/ipfs'

import useConfig from 'utils/useConfig'
import useShopConfig from 'utils/useShopConfig'

const abi = [
  'function updateListing(uint256, bytes32, uint256)',
  'event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash)',
  'event ListingUpdated (address indexed party, uint indexed listingID, bytes32 ipfsHash)'
]

/**
 * Returns the most recent listing data's IPFS hash.
 *
 * @param {Object} provider: ether.js provider.
 * @param {Object} contract: ether.js contract object for the marketplace.
 * @param {Integer} contractEpoch: block number at which contract was created.
 * @param {string} seller: ethereum address of the seller
 * @param {Integer} listingId: id of the listing in the marketplace contract.
 * @returns {Promise<string>} IPFS hash
 * @private
 */
async function _getListingLatestIpfsHash(
  provider,
  contract,
  contractEpoch,
  seller,
  listingId
) {
  const listingCreatedFilter = contract.filters.ListingCreated(
    seller,
    listingId,
    null
  )
  listingCreatedFilter.fromBlock = contractEpoch || 0
  const listingUpdatedFilter = contract.filters.ListingCreated(
    seller,
    listingId,
    null
  )
  listingUpdatedFilter.fromBlock = contractEpoch || 0

  const listingCreatedEvents = await provider.getLogs(listingCreatedFilter)
  const listingUpdatedEvents = await provider.getLogs(listingUpdatedFilter)
  let latestEvent
  if (listingUpdatedEvents && listingUpdatedEvents.length > 0) {
    latestEvent = listingUpdatedEvents[listingUpdatedEvents.length - 1]
  } else if (listingCreatedEvents && listingCreatedEvents.length === 1) {
    latestEvent = listingCreatedEvents[0]
  } else {
    throw new Error(
      `Failed getting the listing's latest IPFS hash from contract's events`
    )
  }
  const bytes32Hash = latestEvent.data
  return getIpfsHashFromBytes32(bytes32Hash)
}

/**
 * Update a marketplace listing's IPFS data by adding a field "shopIpfsHash" that points to
 * the IPFS hash of the DShop associated with the listing.
 *
 * @param {Object} config: shop config
 * @param {string} shopIpfsHash: IPFS hash for the DShop associated with the listing.
 * @returns {Promise<void>}
 */
async function updateListing(config, shopIpfsHash) {
  if (!shopIpfsHash) {
    console.error('shop IPFS hash not provided')
    return
  }
  if (shopIpfsHash.length !== 46) {
    console.error('Invalid IPFS hash')
    return
  }

  const enabled = await window.ethereum.enable()
  if (!enabled) {
    console.error('No web3 provider detected in the browser')
    return
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const providerNetwork = await provider.getNetwork()
  if (providerNetwork.chainId !== parseInt(config.netId)) {
    console.error(
      `Provider network should be ${config.netId} vs ${providerNetwork.chainId}`
    )
    return
  }

  const signer = provider.getSigner()
  const address = await signer.getAddress()

  const parts = config.listingId.split('-')
  const marketplaceListingId = parseInt(parts[2])
  console.log(
    'Id of the listing on the marketplace contract=',
    marketplaceListingId
  )

  const contract = new ethers.Contract(config.marketplaceContract, abi, signer)

  // Load the most recent listing's JSON data from IPFS.
  const ipfsHash = await _getListingLatestIpfsHash(
    provider,
    contract,
    config.marketplaceEpoch,
    address,
    marketplaceListingId
  )
  console.log('Listing latest IPFS hash=', ipfsHash)
  const listingData = await get(config.ipfsApi, ipfsHash)

  // Add a "shopIpfsHash" field to the listing's JSON data.
  const updatedListingData = { ...listingData, shopIpfsHash }

  // Upload the modified lising's JSON data to IPFS.
  const bytes32Hash = await post(config.ipfsApi, updatedListingData)
  console.log(
    'Uploaded updated listing data. IPFS hash=',
    getIpfsHashFromBytes32(bytes32Hash)
  )

  // Call the marketplace contract to record the change in data.
  console.log(
    'Calling marketplace updateListing method and waiting for tx to get mined...)'
  )
  const tx = await contract.updateListing(marketplaceListingId, bytes32Hash, 0)
  const receipt = await tx.wait()
  if (receipt.status === 1) {
    console.log('Success. Receipt=', receipt)
  } else {
    console.err('Failure. Receipt=', receipt)
  }
}

const AdminConsole = () => {
  const { config } = useConfig()
  const { shopConfig } = useShopConfig()
  const [encryptedData, setEncryptedData] = useState('')
  const [orderId, setOrderId] = useState('')
  const [readHash, setReadHash] = useState('')
  const [shopIpfsHash, setShopIpfsHash] = useState('')

  return (
    <div className="mt-4">
      <label className="font-weight-bold">Create order via IPFS hash</label>
      <form
        className="d-flex"
        onSubmit={e => {
          e.preventDefault()
          if (!encryptedData) {
            return
          }

          fetch(`${config.ipfsGateway}/ipfs/${encryptedData}`).then(res => {
            if (!res.ok) {
              console.log('Not OK')
              return
            }

            fetch(`${config.backend}/orders/create`, {
              headers: {
                authorization: `bearer ${config.backendAuthToken}`,
                'content-type': 'application/json'
              },
              credentials: 'include',
              method: 'POST',
              body: JSON.stringify({ encryptedData })
            }).then(saveRes => {
              if (!saveRes.ok) {
                console.log('Not OK')
                return
              }
              console.log('Saved OK')
            })
          })
        }}
      >
        <input
          className="form-control"
          placeholder="Encrypted IPFS Hash"
          style={{ maxWidth: 300 }}
          value={encryptedData}
          onChange={e => setEncryptedData(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
      <label className="mt-4 font-weight-bold">Send confirmation email</label>
      <form
        className="d-flex"
        onSubmit={e => {
          e.preventDefault()
          if (!orderId) {
            return
          }

          fetch(`${config.backend}/orders/${orderId}/email`, {
            headers: {
              authorization: `bearer ${config.backendAuthToken}`,
              'content-type': 'application/json'
            },
            credentials: 'include',
            method: 'POST'
          }).then(saveRes => {
            if (!saveRes.ok) {
              console.log('Not OK')
              return
            }
            console.log('OK')
          })
        }}
      >
        <input
          className="form-control"
          placeholder="Order ID"
          style={{ maxWidth: 300 }}
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
      <label className="mt-4 font-weight-bold">Read encrypted hash</label>
      <form
        className="d-flex"
        onSubmit={async e => {
          e.preventDefault()
          if (!readHash) {
            return
          }

          const encryptedData = await get(config.ipfsGateway, readHash, 10000)

          const privateKey = await openpgp.key.readArmored(
            shopConfig.pgpPrivateKey
          )
          if (privateKey.err && privateKey.err.length) {
            throw privateKey.err[0]
          }
          const privateKeyObj = privateKey.keys[0]
          await privateKeyObj.decrypt(shopConfig.pgpPrivateKeyPass)

          const message = await openpgp.message.readArmored(encryptedData.data)
          const options = { message, privateKeys: [privateKeyObj] }

          const decrypted = await openpgp.decrypt(options)

          console.log(JSON.parse(decrypted.data))
        }}
      >
        <input
          className="form-control"
          placeholder="IPFS Hash"
          style={{ maxWidth: 300 }}
          value={readHash}
          onChange={e => setReadHash(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>

      <label className="mt-4 font-weight-bold">Emit ListingUpdated event</label>
      <form
        className="d-flex"
        onSubmit={async e => {
          e.preventDefault()
          if (!shopIpfsHash) {
            return
          }
          console.log('Calling ListingUpdated...')
          updateListing(config, shopIpfsHash)
            .then(() => console.log('Listing updated successfully'))
            .catch(err => console.error('Listing update failed', err.message))
        }}
      >
        <input
          className="form-control"
          placeholder="IPFS Hash"
          style={{ maxWidth: 300 }}
          value={shopIpfsHash}
          onChange={e => setShopIpfsHash(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
    </div>
  )
}

export default AdminConsole
