import { post } from '@origin/ipfs'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { listingInputToIPFS } from './createListing'

import { proxyOwner } from '../../utils/proxy'
import createDebug from 'debug'
const debug = createDebug('origin:updateListing:')

async function updateListing(_, args) {
  const { data, unitData, fractionalData, autoApprove } = args
  const from = args.from || contracts.defaultMobileAccount
  const { listingId } = parseId(args.listingID)
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

  // Ensure that the new total units exceeds the sum of units purchased through
  // all valid offers for this listing. This prevents unitsAvailable from going
  // negative.
  const newUnitsTotal = Number(ipfsData.unitsTotal) || 0
  const listing = await contracts.eventSource.getListing(listingId)
  if (newUnitsTotal < listing.unitsPending) {
    throw new Error('New unitsTotal is lower than units pending sale')
  }

  console.log({
    ipfsData,
    autoApprove,
    additionalDeposit,
    additionalArg: args.additionalDeposit
  })

  if (autoApprove && additionalDeposit > 0) {
    let owner = from, isProxy
    if (contracts.config.proxyAccountsEnabled) {
      owner = await proxyOwner(from)
      isProxy = owner ? true : false
    }
    if (isProxy) {
      const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
      const txData = await contracts.marketplaceExec.methods
        .updateListing(listingId, ipfsHash, additionalDeposit)
        .encodeABI()
      debug('Using proxy', {
        from,
        owner,
        txData,
        marketplace: contracts.marketplace._address,
        ogn: contracts.ognExec._address,
        additionalDeposit
      })
      tx = Proxy.methods.transferTokenMarketplaceExecute(
        owner,
        contracts.marketplace._address,
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
        contracts.marketplace._address,
        additionalDeposit,
        fnSig,
        params
      )
      gas += 100000
    }
  } else {
    tx = contracts.marketplaceExec.methods.updateListing(
      listingId,
      ipfsHash,
      additionalDeposit
    )
  }

  return txHelper({
    tx,
    from,
    mutation,
    gas
  })
}

export default updateListing
