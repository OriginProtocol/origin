
/**
 * Returns the type of listing
 * @param {Object} listing 
 */
const useListingType = listing => {
  if (!listing) {
    return {}
  }

  const isSingleUnit =
    listing.__typename === 'UnitListing' && listing.unitsTotal === 1
  const isMultiUnit = listing.multiUnit
  const isFractional = listing.__typename === 'FractionalListing'
  const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
  const isService = listing.__typename === 'ServiceListing'
  const isAnnouncement = listing.__typename === 'AnnouncementListing'
  const isGiftCards = listing.__typename === 'GiftCardListing'

  return {
    isSingleUnit,
    isMultiUnit,
    isFractional,
    isFractionalHourly,
    isService,
    isAnnouncement
  }
}