import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { proxyOwner } from '../../utils/proxy'

async function finalizeOffer(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/review_1.0.0.json'
  }
  const { listingId, offerId, marketplace } = parseId(data.offerID, contracts)

  if (data.rating !== undefined) {
    ipfsData.rating = data.rating
  }
  if (data.review !== undefined) {
    ipfsData.text = data.review
  }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  let tx = marketplace.contractExec.methods.finalize(
    listingId,
    offerId,
    ipfsHash
  )

  let gas = cost.finalizeOffer

  // If both buyer and seller are transacting via proxies, use convenience
  // method to finalize and transfer funds to seller in single transaction.
  const owner = await proxyOwner(from)
  if (owner) {
    const listing = await marketplace.eventSource.getListing(listingId)
    const sellerOwner = await proxyOwner(listing.seller.id)

    if (sellerOwner) {
      const offer = await marketplace.eventSource.getOffer(listingId, offerId)
      const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
      const txData = await tx.encodeABI()

      tx = Proxy.methods.marketplaceFinalizeAndPay(
        marketplace.contract._address,
        txData,
        listing.seller.id,
        offer.currency,
        offer.value
      )
      gas += 100000
    }
  }

  return txHelper({
    tx,
    from,
    mutation: 'finalizeOffer',
    gas
  })
}

export default finalizeOffer
