import { translateListingCategory } from 'utils/translationUtils'
import { getBoostLevel } from 'utils/boostUtils'
import fetchSchema from 'utils/schemaAdapter'
import origin from '../services/origin'
import { offerStatusToListingAvailability } from 'utils/offer'
import { formattedAddress } from 'utils/user'

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
      availability: formData.availability,
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
    priceCurrency: originListing.price && originListing.price.currency,
    boostValue: isMultiUnit ? commissionPerUnit : commission,
    boostLevel: getBoostLevel(commission),
    unitsTotal: originListing.unitsTotal,
    unitsRemaining: originListing.unitsRemaining,
    unitsSold: originListing.unitsSold,
    unitsPending: originListing.unitsPending,
    ipfsHash: originListing.ipfs.hash,
    isUnit,
    isFractional,
    isMultiUnit,
    listingType: originListing.type,
    availability: originListing.availability,
    fractionalTimeIncrement: isFractional && slotLengthUnit === 'schema.hours' ? 'hourly' : 'daily',
    offers: originListing.offers,
    events: originListing.events,
    isEmptySeller: originListing.isEmptySeller
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
 * Gets the derived data that describes additional states of a listing that help with rendering. (Displaying
 * various badges and UI elements)
 * @param {object} listing - Dapp listing object with offers
 * @return {object}
 */
export function getDerivedListingData(listing, usersWalletAddress = null) {
  const {
    status,
    unitsTotal,
    isMultiUnit,
    offers,
    display,
    seller,
    unitsRemaining,
    isFractional,
    boostRemaining,
    availability
  } = listing

  /* Find the most relevant offer where user is a seller. If there is a pending offer choose
   * that one, if not choose a sold one (if one exists).
   */
  const userIsSellerOffer = (() => {
    if (usersWalletAddress === null || formattedAddress(usersWalletAddress) !== formattedAddress(listing.seller))
      return undefined

    const findOfferWithAvailability = (status) => {
      return offers.find(offer => {
        const availability = offerStatusToListingAvailability(offer.status)
        return availability === status
      })
    }
    const pendingOffer = findOfferWithAvailability('pending')
    if (pendingOffer)
      return pendingOffer

    const soldOffer = findOfferWithAvailability('sold')
    if (soldOffer)
      return soldOffer

    return undefined
  })()

  const userIsBuyerOffers = offers.filter(offer => {
    const availability = offerStatusToListingAvailability(offer.status)

    return ['pending', 'sold'].includes(availability) && usersWalletAddress !== null &&
      formattedAddress(usersWalletAddress) === formattedAddress(offer.buyer)
  })

  const multiUnitListingIsSold = () => {
    const unitsSold = offers.reduce((accumulator, offer) => {
      return accumulator += offerStatusToListingAvailability(offer.status) === 'sold' ? offer.unitsPurchased : 0
    }, 0)

    return unitsSold === unitsTotal
  }

  const offerWithStatusExists = (status) => {
    return offers.some(offer => {
      return offerStatusToListingAvailability(offer.status) === status
    })
  }

  let total = 0
  let priceCount = 0
  let averagePrice = 0
  if (isFractional) {
    availability.map((event) => {
      if (Array.isArray(event)) {
        event.map((arr) => {
          if (Array.isArray(arr)) {
            const isPriceArr = arr.includes('x-price')

            if (isPriceArr) {
              total += (arr[3] && parseFloat(arr[3]))
              priceCount++
            }
          }
        })
      }
    })

    averagePrice = total / priceCount
  }

  const isWithdrawn = status === 'inactive'
  const isPending = isMultiUnit ? false : offerWithStatusExists('pending')
  const isSold = isMultiUnit ? multiUnitListingIsSold() : offerWithStatusExists('sold')
  const isAvailable = isMultiUnit ? unitsRemaining > 0 : (!isPending && !isSold && !isWithdrawn)
  const showPendingBadge = isPending && !isWithdrawn && !isFractional && !listing.isEmptySeller
  const showSoldBadge = (isSold || isWithdrawn) && !isFractional
  const showRemainingBoost = isMultiUnit && boostRemaining > 0

  /* When ENABLE_PERFORMANCE_MODE env var is set to false even the search result page won't
   * show listings with the Featured badge, because listings are loaded from web3. We could
   * pass along featured information from elasticsearch, but that would increase the code
   * complexity.
   *
   * Deployed versions of the DApp will always have ENABLE_PERFORMANCE_MODE set to
   * true, and show "featured" badge.
   */
  const showFeaturedBadge = display === 'featured' && isAvailable

  return {
    userIsSellerOffer,
    isWithdrawn,
    isPending,
    isSold,
    isAvailable,
    showPendingBadge,
    showSoldBadge,
    showFeaturedBadge,
    userIsBuyerOffers,
    userIsBuyerOffer: userIsBuyerOffers.length > 0 ? userIsBuyerOffers[0] : undefined,
    userIsBuyer: userIsBuyerOffers.length > 0,
    userIsSeller: usersWalletAddress !== null && formattedAddress(usersWalletAddress) === formattedAddress(seller),
    showRemainingBoost,
    averagePrice
  }
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

  const originListing = await origin.marketplace.getListing(id, { blockInfo: blockInfo, loadOffers: !!loadOffers })
  const dappListing = await originToDAppListing(originListing)
  if (translate) {
    dappListing.category = translateListingCategory(dappListing.category)
    dappListing.subCategory = translateListingCategory(dappListing.subCategory)
  }

  return dappListing
}

/**
 * Loads a listing render details form.
 * @param {string} selectedSchemaId - Listing selectedSchemaId.
 * @return {Promise<object>} DApp compatible listing details form object.
 */
export async function getRenderDetailsForm(dappSchemaData) {
  const schemaData = await fetchSchema(dappSchemaData)
  const {
    schema
  } = schemaData

  return schema
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
