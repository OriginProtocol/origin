const useListingType = listing => {
  const singleUnit =
    listing.__typename === 'UnitListing' && listing.unitsTotal === 1
  const multiUnit = listing.multiUnit
  const isFractional = listing.__typename === 'FractionalListing'
  const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
  const isService = listing.__typename === 'ServiceListing'

  return {
    isSingleUnit: singleUnit,
    isMultiUnit: multiUnit,
    isFractional,
    isFractionalHourly,
    isService
  }
}

export default useListingType
