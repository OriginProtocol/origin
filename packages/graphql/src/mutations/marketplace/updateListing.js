import { post } from '@origin/ipfs'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { listingInputToIPFS } from './createListing'

import { proxyOwner } from '../../utils/proxy'

async function updateListing(_, args) {
  const { data, unitData, fractionalData, autoApprove } = args
  const from = args.from || contracts.defaultMobileAccount
  const { listingId, marketplace } = parseId(args.listingID, contracts)
  await checkMetaMask(from)

  const ipfsData = listingInputToIPFS(data, unitData, fractionalData)
  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)

  let tx
  let gas = cost.updateListing
  let mutation = 'updateListing'

  const additionalDeposit = contracts.web3.utils.toWei(
    args.additionalDeposit,
    'ether'
  )

  if (autoApprove && additionalDeposit > 0) {
    let owner = from,
      isProxy
    if (contracts.config.proxyAccountsEnabled) {
      owner = await proxyOwner(from)
      isProxy = owner ? true : false
    }
    if (isProxy) {
      const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
      const txData = await marketplace.contractExec.methods
        .updateListing(listingId, ipfsHash, additionalDeposit)
        .encodeABI()

      tx = Proxy.methods.transferTokenMarketplaceExecute(
        owner,
        marketplace.contract._address,
        txData,
        contracts.ognExec._address,
        additionalDeposit
      )
      mutation = 'transferTokenMarketplaceExecute'
      gas += 1500000
    } else {
      const fnSig = contracts.web3.eth.abi.encodeFunctionSignature(
        'updateListingWithSender(address,uint256,bytes32,uint256)'
      )
      const params = contracts.web3.eth.abi.encodeParameters(
        ['uint256', 'bytes32', 'uint256'],
        [listingId, ipfsHash, additionalDeposit]
      )
      tx = contracts.ognExec.methods.approveAndCallWithSender(
        marketplace.contract._address,
        additionalDeposit,
        fnSig,
        params
      )
      gas += 100000
    }
  } else {
    tx = marketplace.contractExec.methods.updateListing(
      listingId,
      ipfsHash,
      additionalDeposit
    )
  }

  return txHelper({
    tx,
    from,
    mutation,
    gas,
    onReceipt: () => marketplace.eventSource.resetMemos(),
    onConfirmation: () => marketplace.eventSource.resetMemos()
  })
}

export default updateListing
