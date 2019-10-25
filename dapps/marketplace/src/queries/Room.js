import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Room($id: String!, $before: Int, $after: Int) {
    messaging(id: "defaultAccount") {
      id
      enabled
      isKeysLoading
      conversation(id: $id, before: $before, after: $after) {
        id
        timestamp
        totalUnread
        messages {
          index
          address
          content
          status
          hash
          media {
            url
            contentType
          }
          timestamp
          type
          offer {
            ...basicOfferFields
            listing {
              ...basicListingFields
            }
          }
          eventData {
            offerID
            eventType
          }
        }
        hasMore
      }
    }
  }
  ${fragments.Listing.basic}
  ${fragments.Offer.basic}
`
