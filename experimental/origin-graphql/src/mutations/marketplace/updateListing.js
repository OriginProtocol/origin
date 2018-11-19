import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import { listingInputToIPFS } from './createListing'

async function updateListing(_, args) {
  const { listingID, data, from, autoApprove } = args
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let updateListingCall
  const additionalDeposit = web3.utils.toWei(args.additionalDeposit, 'ether')

  if (autoApprove && additionalDeposit > 0) {
    const fnSig = web3.eth.abi.encodeFunctionSignature(
      'updateListingWithSender(address,uint256,bytes32,uint256)'
    )
    const params = web3.eth.abi.encodeParameters(
      ['uint256', 'bytes32', 'uint256'],
      [listingID, ipfsHash, additionalDeposit]
    )
    updateListingCall = contracts.ognExec.methods.approveAndCallWithSender(
      contracts.marketplace._address,
      additionalDeposit,
      fnSig,
      params
    )
  } else {
    updateListingCall = contracts.marketplaceExec.methods.updateListing(
      listingID,
      ipfsHash,
      additionalDeposit
    )
  }

  const tx = updateListingCall.send({ gas: 4612388, from })
  return txHelper({ tx, mutation: 'updateListing' })
}

export default updateListing
