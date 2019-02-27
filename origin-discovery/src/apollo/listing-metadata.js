/* Caches hidden & featured listings ids and updates them according
 * to configuration.
 */
const fetch = require('node-fetch')
// frequency of featured/hidden listings list updates
const METADATA_STALE_TIME = 60 * 1000 // 60 seconds

class ListingMetadata {
  constructor() {
    const networkId = process.env.NETWORK_ID
    this.featuredListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/featurelist_${networkId}.txt`
    this.hiddenListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/hidelist_${networkId}.txt`
    this.hiddenIds = []
    this.featuredIds = []
    this.listingsUpdateTime = undefined
  }

  async readListingsFromUrl(githubUrl) {
    const response = await fetch(githubUrl)
    return (await response.text())
      .split(',')
      .map(listingId => listingId.trim())
      .filter(listingId => listingId.match(/\d*-\d*-\d*/) !== null)
  }

  async updateHiddenFeaturedListings() {
    if (
      !this.listingsUpdateTime ||
      new Date() - this.listingsUpdateTime > METADATA_STALE_TIME
    ) {
      try {
        this.listingsUpdateTime = new Date()
        this.hiddenIds = await this.readListingsFromUrl(this.hiddenListingsUrl)
        this.featuredIds = await this.readListingsFromUrl(
          this.featuredListingsUrl
        )
        console.log(
          `Hidden/Featured lists updated with number of items hidden:${
            this.hiddenIds.length
          } featured:${this.featuredIds.length}`
        )
      } catch (e) {
        console.error('Could not update hidden/featured listings ', e)
      }
    }
  }

  getDisplay(listingId) {
    let display = 'normal'
    if (this.hiddenIds.includes(listingId)) {
      display = 'hidden'
    } else if (this.featuredIds.includes(listingId)) {
      display = 'featured'
    }
    return display
  }
}

const metadata = new ListingMetadata()

module.exports = metadata
