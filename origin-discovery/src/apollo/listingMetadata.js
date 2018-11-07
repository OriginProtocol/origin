// how frequently featured/hidden listings list updates
const LISTINGS_STALE_TIME = 60 * 1000 //60 seconds
const fetch = require('node-fetch')

class ListingMetadata {
  constructor () {
    const networkId = process.env.NETWORK_ID
    this.featuredListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/featurelist_${networkId}.txt`
    this.hiddenListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/hidelist_${networkId}.txt`
    this.listingInfo = {
     hiddenListings: [],
     featuredListings: []
    }
    this.listingsUpdateTime
  }

  async readListingsFromUrl (githubUrl) {
    let response = await fetch(githubUrl)
    return (await response.text())
      .split(',')
      .map(listingId => listingId.trim())
      .filter(listingId => listingId.match(/\d*-\d*-\d*/) !== null)
  }

  async updateHiddenFeaturedListings () {
    if (!this.listingsUpdateTime || new Date() - this.listingsUpdateTime > LISTINGS_STALE_TIME){
      try{
        this.listingsUpdateTime = new Date()
        this.listingInfo.hiddenListings = await this.readListingsFromUrl(this.hiddenListingsUrl)
        this.listingInfo.featuredListings = await this.readListingsFromUrl(this.featuredListingsUrl)
      } catch(e) {
        console.error("Could not update hidden/featured listings ", e)
      }
    }
  }
}

module.exports = ListingMetadata