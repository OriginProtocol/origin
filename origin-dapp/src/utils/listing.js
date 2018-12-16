import { translateListingCategory } from 'utils/translationUtils'
import { getBoostLevel } from 'utils/boostUtils'
import fetchSchema from 'utils/schemaAdapter'
import origin from '../services/origin'

/**
 * Transforms data from the listing creation form into Origin Protocol core listing schema v1
 * which can then be used for creating a listing in the system.
 *
 * @param {object} formData - Data captured by the listing creation form.
 * @return {object} Data in the Origin Protocol core listing schema v1.
 */
export function dappFormDataToOriginListing(formData) {
  const subCategory = formData.subCategory
  const category = formData.category

  let listingData = {
    dappSchemaId: formData.dappSchemaId,
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
      commission: {
        amount: formData.boostValue.toString(),
        currency: 'OGN'
      },
      slots: formData.slots,
      slotLength: formData.slotLength,
      slotLengthUnit: formData.slotLengthUnit
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
export async function originToDAppListing(originListing) {
  const isUnit = originListing.type === 'unit'
  const isMultiUnit = isUnit && originListing.unitsTotal > 1
  const isFractional = originListing.type === 'fractional'

  const commission = originListing.commission
    ? parseFloat(originListing.commission.amount)
    : 0

  // detect and adapt listings that were created by deprecated schemas
  const schemaData = await fetchSchema(originListing)
  const {
    category,
    subCategory,
    dappSchemaId,
    slotLength,
    slotLengthUnit,
    schema,
    isDeprecatedSchema
  } = schemaData

  const commissionPerUnit = originListing.commissionPerUnit
    ? parseFloat(originListing.commissionPerUnit.amount)
    : 0

  const dappListing = {
    id: originListing.id,
    seller: originListing.seller,
    status: originListing.status,
    category,
    subCategory,
    dappSchemaId,
    slotLength,
    slotLengthUnit,
    schema,
    isDeprecatedSchema,
    display: originListing.display,
    name: originListing.title,
    description: originListing.description,
    pictures: originListing.media
      ? originListing.media.map(medium => medium.url)
      : [],
    price: originListing.price && originListing.price.amount,
    boostValue: isMultiUnit ? commissionPerUnit : commission,
    boostLevel: getBoostLevel(commission),
    unitsTotal: originListing.unitsTotal,
    unitsRemaining: originListing.unitsRemaining,
    ipfsHash: originListing.ipfs.hash,
    isUnit: isUnit,
    isFractional: isFractional,
    isMultiUnit: isMultiUnit,
    listingType: originListing.type,
    slots: originListing.slots,
    slotLengthUnit: isFractional && listing.slotLengthUnit,
    fractionalTimeIncrement: isFractional && slotLengthUnit === 'schema.hours' ? 'hourly' : 'daily',
    offers: originListing.offers,
    events: originListing.events
  }

  if (isMultiUnit) {
    dappListing.totalBoostValue = commission
    dappListing.boostRemaining = originListing.commissionRemaining
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

/**
 * Transforms an array of purchases or sales from a origin-js format to dapp format
 * and translates the category
 * @param {array} purchasesOrSales - Array of purchases or sales from origin-js's getPurchases() or getSales()
 * @param {object} purchasesOrSales.listing - listing object
 * @param {object} purchasesOrSales.offer - offer object
 * @return {array} Transformed array of purchases or sales objects
 */
export const transformPurchasesOrSales = async purchasesOrSales => {
  const promises = purchasesOrSales.map(async purchase => {
    const { offer, listing } = purchase
    const transformedListing = await originToDAppListing(listing)
    transformedListing.category = translateListingCategory(transformedListing.category)
    return {
      offer,
      listing: transformedListing
    }
  })

  return Promise.all(promises)
}

/**
 * Loads a listing from origin-js, transforms it into a DApp compatible object and optionally
 * translates the listing's category.
 * @param {string} id - Listing ID.
 * @param {object} opts - listing fetch options
 * - {boolean} translate - Whether to translate the listing category or not.
 * - {boolean} loadOffers - Should listing also contiain offers
 * - {object} blockInfo - Should listing also contiain offers
 * @return {Promise<object>} DApp compatible listing object.
 */
export async function getListing(id, opts = {}) {
  const {
    translate,
    loadOffers,
    blockInfo
  } = opts

  const originListing = await origin.marketplace.getListing(id, blockInfo, { loadOffers: !!loadOffers })
  const dappListing = await originToDAppListing(originListing)
  if (!!translate) {
    dappListing.category = translateListingCategory(dappListing.category)
    dappListing.subCategory = translateListingCategory(dappListing.subCategory)
  }

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
