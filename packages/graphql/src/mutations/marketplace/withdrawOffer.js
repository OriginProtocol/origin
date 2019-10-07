import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { proxyOwner } from '../../utils/proxy'

async function withdrawOffer(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId, marketplace } = parseId(data.offerID, contracts)
  const contract = marketplace.contract
  const { withdrawOffer } = marketplace.contractExec.methods

  let tx = withdrawOffer(listingId, offerId, ipfsHash)

  let gas = cost.withdrawOffer

  const owner = await proxyOwner(from)
  if (owner) {
    const offer = await contract.methods.offers(listingId, offerId).call()
    const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
    const txData = await tx.encodeABI()

    tx = Proxy.methods.marketplaceFinalizeAndPay(
      marketplace.contract._address,
      txData,
      offer.buyer,
      offer.currency,
      offer.value
    )
    gas += 100000
  }

  return txHelper({
    tx,
    from,
    mutation: 'withdrawOffer',
    gas,
    onReceipt: () => {
      // Clear eventSource cache
      // TODO: If unneeded, remove before merge
      Object.keys(contracts.marketplaces).forEach(v => {
        contracts.marketplaces[v].eventSource.resetCache()
      })
    }
  })
}

export default withdrawOffer
