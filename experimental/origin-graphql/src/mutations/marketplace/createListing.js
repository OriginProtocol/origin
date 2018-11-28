import { post } from 'origin-ipfs'
import validator from 'origin-validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

export function listingInputToIPFS(data) {
  const ipfsData = {
    "schemaId": "http://schema.originprotocol.com/listing_v1.0.0",
    "listingType": "unit",
    "category": "schema.forSale",
    "subCategory": "schema.forSale.mushrooms",
    "language": "en-US",
    "title": data.title,
    "description": data.description,
    "expiry": "1996-12-19T16:39:57-08:00",
    "media": data.media,
    "unitsTotal": data.unitsTotal,
    "price": data.price,
    "commission": {
      "currency": "OGN",
      "amount": "0"
    }
  }
  validator('http://schema.originprotocol.com/listing_v1.0.0', ipfsData)
  return ipfsData
}

async function createListing(_, input) {
  const { depositManager, data, from, autoApprove } = input
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let createListingCall
  const deposit = web3.utils.toWei(String(input.deposit), 'ether')

  if (autoApprove) {
    const fnSig = web3.eth.abi.encodeFunctionSignature(
      'createListingWithSender(address,bytes32,uint256,address)'
    )
    const params = web3.eth.abi.encodeParameters(
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

  return txHelper({
    tx: createListingCall.send({
      gas: 4612388,
      from: from
    }),
    mutation: 'createListing'
  })
}

export default createListing

/*
mutation createListing($deposit: String, $arbitrator: String) {
  createListing(deposit: $deposit, arbitrator: $arbitrator)
}
{ "deposit": "0", "arbitrator": "0xBECf244F615D69AaE9648E4bB3f32161A87caFF1" }
*/
