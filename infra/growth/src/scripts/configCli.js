'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const Logger = require('logplease')
const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('configCli')

const contentTypeToExtension = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

class ConfigCli {
  constructor(config) {
    this.config = config
    this.listingIds = this.config.listingIds.trim().split(',')
    this.stats = {
      numListings: 0
    }
  }

  async _downloadImage(listingId) {
    // Query graphql server to get the URLs for the listing images.
    logger.info(`Querying graphql server for listing ${listingId}`)
    const query = `
      query {
        marketplace {
          listing(id: "${listingId}") {
          ...on Listing {
              media {
                urlExpanded
              }
            }
          }
        }
      }`
    let response = await fetch('https://graphql.originprotocol.com', {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ query })
    })
    if (!response.ok) {
      throw new Error(`Query failed: ${response}`)
    }

    const jsonResponse = await response.json()
    const imageUrls = jsonResponse.data.marketplace.listing.media
    if (!imageUrls) {
      throw new Error(`No image associated with listing ${listingId}`)
    }

    // Fetch image and save it to local disk.
    const firstImageUrl = imageUrls[0].urlExpanded
    logger.info(`Fetching image from URL ${firstImageUrl}`)
    response = await fetch(firstImageUrl)
    if (!response.ok) {
      throw new Error(`Query failed: ${response}`)
    }
    const contentType = response.headers.get('content-type')
    const extension = contentTypeToExtension[contentType]
    if (!extension) {
      throw new Error(`Unexpected content type ${contentType}`)
    }
    const imageBinary = await response.buffer()
    const destPath =
      this.config.imagesPath + `/listing-${listingId}.${extension}`
    logger.info(`Saving image to ${destPath}`)
    fs.writeFileSync(destPath, imageBinary)
  }

  async downloadImages() {
    logger.info(
      `Going to fetch images for a total of ${this.listingIds.length} listings...`
    )
    for (const listingId of this.listingIds) {
      await this._fetchListingImage(listingId)
    }
  }

  _generateRule(listingId) {
    const rule = `        {
          id: 'ListingPurchase${listingId}',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '${listingId}',
            reward: {
              amount: tokenToNaturalUnits(75),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-${listingId}-icon.png',
            titleKey: 'growth.purchase.listing-${listingId}.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },`
    console.log(rule)
  }

  generateRules() {
    for (const listingId of this.listingIds) {
      this._generateRule(listingId)
    }
  }
}

/**
 * MAIN
 */
logger.info('Rules config cli.')

// Parse config.
const args = parseArgv()
const config = {
  // Listing ids, comma separated.
  listingIds: args['--listingIds'],
  // Action: downloadImages, generateRules
  action: args['--action'],
  // Path to store listings images.
  imagesPath: args['--imagesPath']
}
logger.info('Config:')
logger.info(config)

// Initialize the job and start it.
const cli = new ConfigCli(config)
switch (config.action) {
  case 'downloadImages':
    cli
      .downloadImages()
      .then(() => {
        logger.info('Finished')
        process.exit()
      })
      .catch(err => {
        logger.error('Error: ', err)
        logger.error('Exiting')
        process.exit(-1)
      })
    break
  case 'generateRules':
    cli.generateRules()
    break
  default:
    logger.error('Unexpected action', config.action)
}
