import { post } from '@origin/ipfs'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { normalCompare } from '../../utils/normalize'
import { proxyOwner } from '../../utils/proxy'

async function acceptOffer(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/offer-accept_1.0.0.json'
  })
  const { listingId, offerId, marketplace } = parseId(data.offerID, contracts)

  const offer = await marketplace.eventSource.getOffer(listingId, offerId)
  if (!offer.valid) {
    throw new Error(`Invalid offer: ${offer.validationError}`)
  }

  let tx = marketplace.contractExec.methods.acceptOffer(
    listingId,
    offerId,
    ipfsHash
  )

  let gas = cost.acceptOffer

  const { seller } = await marketplace.contractExec.methods
    .listings(listingId)
    .call()
  const owner = await proxyOwner(from)

  console.log({
    seller,
    owner,
    from
  })

  // Only use the proxy if the proxy is the seller
  if (owner && normalCompare(seller, from)) {
    const offer = await marketplace.eventSource.getOffer(listingId, offerId)
    const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
    const txData = await tx.encodeABI()

    tx = Proxy.methods.marketplaceFinalizeAndPay(
      marketplace.contract._address,
      txData,
      from,
      offer.currency,
      offer.value
    )
    gas += 100000
  }

  return txHelper({ tx, from, mutation: 'acceptOffer', gas })
}

export default acceptOffer

/*
mutation makeOffer($listingID: String, $offerID: String) {
  acceptOffer(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/
