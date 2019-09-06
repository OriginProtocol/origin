const regex = /(\d*)-(\d*)-(\d*)-(\d*)/

/* Matches when we are not looking at current listing state, rather a snapshot in the past.
 * This can happen when for example user clicks on a listing from a Purchase detail view
 */
export function isHistoricalListing(listing) {
  return !!listing.id.match(regex)
}

export function currentListingIdFromHistoricalId(listing) {
  const historicalListingMatch = listing.id.match(regex)

  if (historicalListingMatch) {
    return `${historicalListingMatch[1]}-${historicalListingMatch[2]}-${
      historicalListingMatch[3]
    }`
  }
  return null
}
