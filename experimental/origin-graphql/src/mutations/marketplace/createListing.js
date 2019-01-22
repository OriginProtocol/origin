import { post } from 'origin-ipfs'
import validator from 'origin-validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

export function listingInputToIPFS(data) {
  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/listing_1.0.0.json',
    listingType: 'unit',
    category: data.category,
    subCategory: data.subCategory,
    language: 'en-US',
    title: data.title,
    description: data.description,
    media: data.media,
    unitsTotal: data.unitsTotal,
    price: data.price,
    commission: {
      currency: 'OGN',
      amount: '0'
    }
  }
  validator('https://schema.originprotocol.com/listing_1.0.0.json', ipfsData)
  return ipfsData
}

async function createListing(_, input) {
  const { depositManager, data, from, autoApprove } = input
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data)
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

  const tx = createListingCall.send({ gas: 4612388, from })
  return txHelper({ tx, from, mutation: 'createListing' })
}

export default createListing
