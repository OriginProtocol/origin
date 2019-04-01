export default function(id) {
  const [netId, contractId, listingId, offerId] = id
    .split('-')
    .map(i => Number(i))
  return { netId, contractId, listingId, offerId, blockNumber: offerId }
}
