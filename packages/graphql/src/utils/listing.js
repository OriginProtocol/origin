import fetch from 'cross-fetch'
import contracts from '../contracts'

const discoveryScoreQuery = `
query Listing($listingId: ID!) {
  listing(id: $listingId) {
    scoreTags
  }
}`

/**
 * Checks if a listing is visible against the discovery server.
 * @param {string} listingId
 * @returns {Promise<boolean>}
 */
export default async function listingIsVisible(listingId) {
  let visible = true
  const variables = { listingId }
  try {
    const res = await fetch(contracts.discovery, {
      headers: {
        'content-type': 'application/json',
        'x-discovery-auth-token': process.env.DISCOVERY_AUTH_TOKEN
      },
      method: 'POST',
      body: JSON.stringify({ query: discoveryScoreQuery, variables })
    })
    if (res.status !== 200) {
      throw new Error(`Discovery server returned status ${res.status}`)
    }
    const response = await res.json()
    const tags = response.data.listing.scoreTags || []
    visible = !(tags.includes('Hide') || tags.includes('Delete'))
  } catch (err) {
    // Log the error but do no fail the visibility check.
    // The discovery server could be temporarily down.
    console.err(`Failed visibility check for listing ${listingId}`, err)
  }
  return visible
}
