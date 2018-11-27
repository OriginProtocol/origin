export default function(id) {
  const [netId, contractId, listingId, offerId] = id.split('-')
  return { netId, contractId, listingId, offerId }
}
