/*
 *  @function schemaAdapter
 *  @description fetches the schema for a given listing
 *               and maps deprecated schema versions to existing versions as needed.
 *               Used in /utils/listing.js 
 *  @param {object} listing - the listing object fetched from IPFS
 *  @returns {object} object keys are "category" (string), "schema" (object), and "isDeprecated" (boolean)
 */

export default async (listing) => {
  let { dappSchemaId } = listing
  const hostname = window.location.hostname
  const isLocal = hostname === 'localhost' || hostname === '0.0.0.0'

  // if the listing has a dappSchemaId, it was created using one of the newer generation of schemas
  if (dappSchemaId) {
    // try fetching schema by ID.
    try {
      if (isLocal) {
        dappSchemaId = dappSchemaId.replace('https://dapp.originprotocol.com', 'http://localhost:3000')
      }

      return fetch(dappSchemaId)
      .then(response => response.json())
      .then(schemaJson => {
        // If it succeeds, the listing was created with a current schema and all is well.
        return {
          category: schemaJson.category,
          schema: schemaJson,
          isDeprecatedSchema: false
        }
      })
    } catch(e) {
      // If the lisitng was created with a deprecated schema,
      // try to map it to a valid schema and fetch that schema
      // let newSchemaId

      // NOTE(John) - Leaving this code here as an example of how we can bump schema versions when needed

      // switch(dappSchemaId) {
      //   // a hypothetical version bump example
      //   case 'https://dapp.originprotocol.com/schemas/forRent-housing_1.0.0.json':
      //     newSchemaId = 'https://dapp.originprotocol.com/schemas/forRent-housing_1.0.1.json'
      //     break
      // }

      // return fetch(newSchemaId)
      // .then(response => response.json())
      // .then(schemaJson => {
      //   return {
      //     category: schemaJson.category,
      //     schema: schemaJson,
      //     isDeprecatedSchema: true
      //   }
      // })
    }
  } else {
    // Since we don't have a dappSchemaId, this listing must've been created using an older generation of schema.
    // So, we need to try to map it to a newer generation schema using the category / sub-category
    // NOTE - mapping all of these to "unit" schemas because they were created before fractional usage was released
    const { category } = listing
    let newSchemaId

    switch(category) {
      case 'schema.housing':
        newSchemaId = 'https://dapp.originprotocol.com/schemas/forSale-realEstate_1.0.0.json'
        break
      case 'schema.tickets':
        newSchemaId = 'https://dapp.originprotocol.com/schemas/forSale-tickets_1.0.0.json'
        break
      case 'schema.forSale':
        newSchemaId = 'https://dapp.originprotocol.com/schemas/forSale-other_1.0.0.json'
        break
      default:
        newSchemaId = 'https://dapp.originprotocol.com/schemas/forSale-other_1.0.0.json'
        break
    }

    if (isLocal) {
      newSchemaId = newSchemaId.replace('https://dapp.originprotocol.com', 'http://localhost:3000')
    }

    return fetch(newSchemaId)
      .then(response => response.json())
      .then(schemaJson => {
        return {
          category: schemaJson.properties.category.const,
          schema: schemaJson,
          isDeprecatedSchema: true
        }
      })
  }
}
