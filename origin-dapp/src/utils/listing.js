import { translateListingCategory } from 'utils/translationUtils'
import { getBoostLevel } from 'utils/boostUtils'
import origin from '../services/origin'

/**
 * Transforms data from the listing creation form into Origin Protocol core listing schema v1
 * which can then be used for creating a listing in the system.
 *
 * @param {object} formData - Data captured by the listing creation form.
 * @return {object} Data in the Origin Protocol core listing schema v1.
 */
export function dappFormDataToOriginListing(formData) {
  // formData.category data format is "schema.<category>.<subCategory>".
  const subCategory = formData.category
  const category = formData.category
    .split('.')
    .slice(0, 2)
    .join('.')

  let listingData = {
    category: category,
    subCategory: subCategory,
    language: 'en-US', // TODO(franck) Get language from DApp.
    title: formData.name,
    description: formData.description,
    listingType: formData.listingType,
    unitsTotal: formData.unitsTotal
  }

  if (formData.listingType === 'unit') {
    let listingDataAddition

    // if multi unit listing
    if (formData.unitsTotal > 1) {
      const boostLimit = formData.boostLimit || 0
      listingDataAddition = {
        commission: {
        amount: boostLimit.toString(),
        currency: 'OGN'
        },
        commissionPerUnit: {
          amount: formData.boostValue.toString(),
          currency: 'OGN'
        }
      }
    } else {
      listingDataAddition = {
        commission: {
        amount: formData.boostValue.toString(),
        currency: 'OGN'
        }
      }
    }

    listingData = {
      ...listingData,
      price: {
        amount: formData.price.toString(),
        currency: 'ETH'
      },
      ...listingDataAddition
    }
  } else {
    listingData = {
      ...listingData,
      timeIncrement: formData.timeIncrement,
      slots: formData.slots,
      commission: {
        amount: formData.boostValue.toString(),
        currency: 'OGN'
      },
      calendarStep: '60' // Note: this is currently always 60 minutes but may change later to allow for sub-1hr slots
    }
  }

  if (formData.pictures) {
    listingData.media = []
    for (const data of formData.pictures) {
      // Extract the content type from the data URL.
      // format is "data:<contentType>>;name=<filename>;base64,<image data>".
      const contentType = data.split(';')[0].substring(5)
      const medium = { url: data, contentType }
      listingData.media.push(medium)
    }
  }

  return listingData
}

/**
 * Transforms listing data returned by origin-js into a DApp compatible listing object.
 *
 * TODO: Eliminate this transform by updating the DApp code to manipulate
 *       directly origin-js listing objects.
 *
 * @param {Listing} originListing - Listing object returned by origin-js.
 * @return {object} DApp compatible listing object.
 */
export function originToDAppListing(originListing, translate) {
  const commission = originListing.commission
    ? parseFloat(originListing.commission.amount)
    : 0

  const isUnit = originListing.listingType === 'unit'
  const dappListing = {
    id: originListing.id,
    seller: originListing.seller,
    status: originListing.status,
    schemaType: originListing.category.replace('schema.', ''),
    category: translate ? translateListingCategory(originListing.subCategory) : originListing.subCategory,
    display: originListing.display,
    name: originListing.title,
    description: originListing.description,
    pictures: originListing.media
      ? originListing.media.map(medium => medium.url)
      : [],
    price: originListing.price && originListing.price.amount,
    boostValue: commission,
    boostLevel: getBoostLevel(commission),
    unitsTotal: originListing.unitsTotal,
    ipfsHash: originListing.ipfs.hash,
    isUnit: isUnit,
    isFractional: originListing.listingType === 'fractional',
    isMultiUnit: isUnit && originListing.unitsTotal > 1,
    listingType: originListing.type,
    slots: originListing.slots,
    events: originListing.events
  }

  // if multiunit listing
  if (isUnit && originListing.unitsTotal > 1) {
    const commissionPerUnit = originListing.commissionPerUnit
      ? parseFloat(originListing.commissionPerUnit.amount)
      : 0

    dappListing.commissionPerUnit = commissionPerUnit
  }

  return dappListing
}

export function addOffersToDappListing(dappListing, offers){
  console.log("ADDING OFFERS TO DAPP LISTING: ", dappListing, offers)
  return dappListing
}

/**
 * Transforms an array of purchases or sales from a origin-js format to dapp format
 * and translates the category
 * @param {array} purchasesOrSales - Array of purchases or sales from origin-js's getPurchases() or getSales()
 * @param {object} purchasesOrSales.listing - listing object
 * @param {object} purchasesOrSales.offer - offer object
 * @return {array} Transformed array of purchases or sales objects
 */
export const transformPurchasesOrSales = purchasesOrSales => {
  return purchasesOrSales.map(purchase => {
    const { offer, listing } = purchase
    return {
      offer,
      listing: originToDAppListing(listing, true)
    }
  })
}

/**
 * Loads a listing from origin-js, transforms it into a DApp compatible object and optionally
 * translates the listing's category.
 * @param {string} id - Listing ID.
 * @param {boolean} translate - Whether to translate the listing category or not.
 * @return {Promise<object>} DApp compatible listing object.
 */
export async function getListing(id, translate = false, blockInfo) {
  const originListing = await origin.marketplace.getListing(id, blockInfo)
  const dappListing = originToDAppListing(originListing, translate)
  return dappListing
}

/**
 * Takes a string with a hyphen in it and returns a camel case version of the string
 * e.g. for-sale becomes forSale
 * @param {string} string - a string with a hyphen
 * @return {string} the string as camel case
 */

export function dashToCamelCase(string) {
  return string.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

/**
 * Takes camel case string and converts it to a string with hyphen(s)
 * e.g. forSale becomes for-sale
 * @param {string} string - a camel case string
 * @return {string} the string with hyphen(s)
 */

export function camelCaseToDash(string) {
  return string.replace(/([a-z][A-Z])/g, g => g[0] + '-' + g[1].toLowerCase())
}
