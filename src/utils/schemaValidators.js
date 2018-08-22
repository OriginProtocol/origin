import Ajv from 'ajv'
import ajvEnableMerge from 'ajv-merge-patch/keywords/merge'
import listingSchema from '../schemas/listing.json'
import unitListingSchema from '../schemas/unit-listing.json'
import unitPurchaseSchema from '../schemas/unit-purchase.json'
import fractionalListingSchema from '../schemas/fractional-listing.json'
import fractionalPurchaseSchema from '../schemas/fractional-purchase.json'
import reviewSchema from '../schemas/review.json'

const unitListingType = 'unit'
const fractionalListingType = 'fractional'

const validListingTypes = [unitListingType, fractionalListingType]

const unitListingSchemaId = 'unit-listing.json'
const fractionalListingSchemaId = 'fractional-listing.json'

const ajv = new Ajv({
  schemas: [
    listingSchema,
    unitListingSchema,
    unitPurchaseSchema,
    fractionalListingSchema,
    fractionalPurchaseSchema,
    reviewSchema
  ]
})
ajvEnableMerge(ajv)

const validateUnitListing = ajv.getSchema(unitListingSchemaId)
const validateFractionalListing = ajv.getSchema(fractionalListingSchemaId)

function validate(validateFn, schema, data) {
  if (!validateFn(data)) {
    throw new Error(
      `Data invalid for schema. Data: ${JSON.stringify(
        data
      )}. Schema: ${JSON.stringify(schema)}`
    )
  }
}

export function validateListing(ipfsData, contractService) {
  if (!ipfsData.listingType) {
    console.warn('Please specify a listing type. Assuming unit listing type.')
  } else if (!validListingTypes.includes(ipfsData.listingType)) {
    console.error(
      'Listing type ${ipfsData.listingType} is invalid. Assuming unit listing type.'
    )
  }

  if (!ipfsData.unitsAvailable) {
    ipfsData.unitsAvailable = 1
  }
  if (!ipfsData.priceWei && ipfsData.price) {
    ipfsData.priceWei = contractService.web3.utils.toWei(
      String(ipfsData.price),
      'ether'
    )
  }

  const listingType = ipfsData.listingType || unitListingType
  let validateFn, schema
  if (listingType === unitListingType) {
    validateFn = validateUnitListing
    schema = unitListingSchema
  } else if (listingType === fractionalListingType) {
    validateFn = validateFractionalListing
    schema = fractionalListingSchema
  }
  validate(validateFn, schema, ipfsData)
}
