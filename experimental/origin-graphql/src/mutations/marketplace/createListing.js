import { post } from 'origin-ipfs'
import validator from 'origin-validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'

export function listingInputToIPFS(data, unitData, fractionalData) {
  const listingType = fractionalData ? 'fractional' : 'unit'
  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/listing_1.0.0.json',
    listingType,
    category: data.category,
    subCategory: data.subCategory,
    language: 'en-US',
    title: data.title,
    description: data.description,
    media: data.media,
    price: data.price,
    commission: {
      currency: 'OGN',
      amount: data.commission || '0'
    },
    commissionPerUnit: {
      currency: 'OGN',
      amount: data.commissionPerUnit || '0'
    }
  }
  if (listingType === 'unit') {
    ipfsData.unitsTotal = unitData.unitsTotal
  } else if (listingType === 'fractional') {
    ipfsData.weekendPrice =
      fractionalData.weekendPrice || fractionalData.price || '0'
    ipfsData.unavailable = fractionalData.unavailable || []
    ipfsData.customPricing = fractionalData.customPricing || []
    ipfsData.booked = fractionalData.booked || []
  }
  validator('https://schema.originprotocol.com/listing_1.0.0.json', ipfsData)
  return ipfsData
}

async function createListing(_, input) {
  const { depositManager, data, unitData, fractionalData, autoApprove } = input
  const from = input.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data, unitData, fractionalData)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let createListingCall
  const deposit = contracts.web3.utils.toWei(String(input.deposit), 'ether')

  if (autoApprove) {
    const fnSig = contracts.web3.eth.abi.encodeFunctionSignature(
      'createListingWithSender(address,bytes32,uint256,address)'
    )
    const params = contracts.web3.eth.abi.encodeParameters(
      ['bytes32', 'uint', 'address'],
      [ipfsHash, deposit, depositManager]
    )
    createListingCall = contracts.ognExec.methods.approveAndCallWithSender(
      contracts.marketplace._address,
      deposit,
      fnSig,
      params
    )
  } else {
    createListingCall = contracts.marketplaceExec.methods.createListing(
      ipfsHash,
      deposit,
      depositManager
    )
  }

  const tx = createListingCall.send({ gas: cost.createListing, from })
  return txHelper({ tx, from, mutation: 'createListing' })
}

export default createListing
