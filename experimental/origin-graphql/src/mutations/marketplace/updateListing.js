import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'
import { listingInputToIPFS } from './createListing'

async function updateListing(_, args) {
  const { data, from, autoApprove } = args
  const { listingId } = parseId(args.listingID)
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let updateListingCall
  const additionalDeposit = contracts.web3.utils.toWei(
    args.additionalDeposit,
    'ether'
  )

  if (autoApprove && additionalDeposit > 0) {
    const fnSig = contracts.web3.eth.abi.encodeFunctionSignature(
      'updateListingWithSender(address,uint256,bytes32,uint256)'
    )
    const params = contracts.web3.eth.abi.encodeParameters(
      ['uint256', 'bytes32', 'uint256'],
      [listingId, ipfsHash, additionalDeposit]
    )
    updateListingCall = contracts.ognExec.methods.approveAndCallWithSender(
      contracts.marketplace._address,
      additionalDeposit,
      fnSig,
      params
    )
  } else {
    updateListingCall = contracts.marketplaceExec.methods.updateListing(
      listingId,
      ipfsHash,
      additionalDeposit
    )
  }

  const tx = updateListingCall.send({ gas: 4612388, from })
  return txHelper({ tx, mutation: 'updateListing' })
}

export default updateListing
