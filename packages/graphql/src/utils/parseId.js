export default function(id, contracts) {
  const [netId, contractId, listingId, offerId] = id.split('-')
  return {
    netId,
    contractId,
    marketplace: contracts ? contracts.marketplaces[contractId] : null,
    listingId: Number(listingId),
    offerId: Number(offerId),
    blockNumber: offerId
  }
}
