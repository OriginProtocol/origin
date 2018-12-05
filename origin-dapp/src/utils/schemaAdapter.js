// Pseudo-code - WIP for discussion only at this point
// This would be used in /src/utils/listing.js originToDAppListing() method
// to map deprecated schemas to existing ones based on category name

export default async (listing) => {
  const { dappSchemaId } = listing

  // if the listing has a dappSchemaId, it was created using one of the newer generation of schemas
  if (dappSchemaId) {
    try {
      // try fetching schema by ID.
      return fetch(`schemas/${dappSchemaId}.json`)
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
      let newSchemaId

      switch(dappSchemaId) {
        // a hypothetical version bump
        case 'services-design-v00':
          newSchemaId = 'services-design-v01'
          break
        // Other version bumps would go here...
      }

      return fetch(`schemas/${newSchemaId}.json`)
      .then(response => response.json())
      .then(schemaJson => {
        return {
          category: schemaJson.category,
          schema: schemaJson,
          isDeprecatedSchema: true
        }
      })
    }
  } else {
    // Since we don't have a dappSchemaId, this listing must've been created using an older generation of schema.
    // So, we need to try to map it to a newer generation schema using the category / sub-category
    const { category, /*subCategory*/ } = listing
    let newSchemaName

    switch(category) {
      case 'schema.housing':
        newSchemaName = 'forSale-realEstate_1.0.0'
        break
      case 'schema.tickets':
        newSchemaName = 'forSale-tickets_1.0.0'
        break
      case 'schema.forSale':
        newSchemaName = 'forSale-other_1.0.0'
        break
      default:
        newSchemaName = 'forSale-other_1.0.0'
    }

    return fetch(`schemas/${newSchemaName}.json`)
      .then(response => response.json())
      .then(schemaJson => {
        return {
          category: schemaJson.category,
          schema: schemaJson,
          isDeprecatedSchema: true
        }
      })
  }
}
