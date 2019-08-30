import fetch from 'cross-fetch'
import contracts from '../contracts'

const discoveryListingsQuery = `
query visibleListingIds($listingIds: [ID!]) {
  visibleListingIds(
    ids: $listingIds
  )
}`

/**
 * Filters out the listing ids that fail the visibility check.
 * Preserve ids ordering.
 *
 * @param {Array<string>} listingIds: List of listing ids to check
 * @returns {Promise<Array<string>>} List of ids that passed the visibility check.
 */
export async function filterNonVisibleListingIds(listingIds) {
  const discoveryUrl = contracts.discovery
  if (!discoveryUrl) {
    return listingIds
  }
  if (!listingIds.length) {
    return []
  }

  let visibleIds
  try {
    const res = await fetch(discoveryUrl, {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        query: discoveryListingsQuery,
        variables: { listingIds, numberOfItems: listingIds.length }
      })
    })
    if (res.status !== 200) {
      throw new Error(`Discovery server returned status ${res.status}`)
    }
    const response = await res.json()
    visibleIds = response.data.visibleListingIds
  } catch (err) {
    // Log the error but do no fail the visibility check.
    // The discovery server could be temporarily down.
    console.log(
      `ERROR: Failed visibility check for listingIds ${listingIds}`,
      err
    )
    visibleIds = listingIds
  }
  // Note: visibleIds are not guaranteed to be returned in the same order as listingIds.
  // By applying a filter on listingIds, we ensure order is preserved.
  return listingIds.filter(id => visibleIds.indexOf(id) !== -1)
}

/**
 * Checks if a listing is visible against the discovery server.
 * @param {string} listingId
 * @returns {Promise<boolean>}
 *  True if listing is visible or discovery server is not configured. false otherwise.
 */
export async function listingIsVisible(listingId) {
  const visibleIds = await filterNonVisibleListingIds([listingId])
  return visibleIds.length === 1
}
