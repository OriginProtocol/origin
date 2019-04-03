const gql = require('graphql-tag')

const fragments = require('./Fragments')

module.exports = gql`
  query Offer($offerId: ID!) {
    marketplace {
      offer(id: $offerId) {
        listing {
          ...basicListingFields
        }
        ...basicOfferFields
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
