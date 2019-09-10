import { post } from '@origin/ipfs'
import validator from '@origin/validator'

import { resetProxyCache } from '../../utils/proxy'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'

export function listingInputToIPFS(data, unitData, fractionalData) {
  const listingType = fractionalData ? 'fractional' : 'unit'
  const ipfsData = {
    __typename: data.typename || 'UnitListing',
    schemaId: 'https://schema.originprotocol.com/listing_2.0.0.json',
    listingType,
    category: data.category || '',
    subCategory: data.subCategory || '',
    language: 'en-US',
    title: data.title,
    description: data.description,
    media: data.media,
    price: data.price,
    acceptedTokens: data.acceptedTokens || ['token-ETH'],
    commission: {
      currency: 'OGN',
      amount: data.commission || '0'
    },
    commissionPerUnit: {
      currency: 'OGN',
      amount: data.commissionPerUnit || '0'
    },
    requiresShipping: data.requiresShipping || false
  }

  if (data.marketplacePublisher) {
    ipfsData.marketplacePublisher = data.marketplacePublisher
  }
  if (fractionalData) {
    ipfsData.weekendPrice =
      fractionalData.weekendPrice || fractionalData.price || '0'
    ipfsData.unavailable = fractionalData.unavailable || []
    ipfsData.customPricing = fractionalData.customPricing || []
    ipfsData.timeZone = fractionalData.timeZone || ''
    ipfsData.workingHours = fractionalData.workingHours || []
    ipfsData.booked = fractionalData.booked || []
  } else if (data.typename === 'GiftCardListing') {
    ipfsData.retailer = unitData.retailer || ''
    ipfsData.cardAmount = unitData.cardAmount || '0'
    ipfsData.issuingCountry = unitData.issuingCountry || '0'
    ipfsData.isDigital = unitData.isDigital || false
    ipfsData.isCashPurchase = unitData.isCashPurchase || false
    ipfsData.receiptAvailable = unitData.receiptAvailable || false
    ipfsData.unitsTotal = unitData.unitsTotal ? unitData.unitsTotal : 1
  } else if (unitData) {
    ipfsData.unitsTotal = unitData.unitsTotal
  } else {
    ipfsData.unitsTotal = 1
  }

  validator('https://schema.originprotocol.com/listing_2.0.0.json', ipfsData)
  return ipfsData
}

async function createListing(_, input) {
  const { depositManager, data, unitData, fractionalData, autoApprove } = input
  const from = input.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data, unitData, fractionalData)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let tx
  const deposit = contracts.web3.utils.toWei(String(input.deposit), 'ether')

  let version = input.version
  if (!version) {
    const versions = Object.keys(contracts.marketplaces).sort()
    version = versions[versions.length - 1]
  }
  if (!contracts.marketplaces[version]) {
    throw new Error(`No marketplace with version ${version}`)
  }
  const marketplace = contracts.marketplaces[version].contractExec

  if (autoApprove && input.deposit > 0) {
    const fnSig = contracts.web3.eth.abi.encodeFunctionSignature(
      'createListingWithSender(address,bytes32,uint256,address)'
    )
    const params = contracts.web3.eth.abi.encodeParameters(
      ['bytes32', 'uint', 'address'],
      [ipfsHash, deposit, depositManager]
    )
    tx = contracts.ognExec.methods.approveAndCallWithSender(
      marketplace._address,
      deposit,
      fnSig,
      params
    )
  } else {
    tx = marketplace.methods.createListing(ipfsHash, deposit, depositManager)
  }

  return txHelper({
    tx,
    from,
    mutation: 'createListing',
    gas: cost.createListing,
    onConfirmation: () => resetProxyCache()
  })
}

export default createListing
