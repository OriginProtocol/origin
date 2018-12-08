import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
  query Listing($listingId: String!) {
    web3 {
      metaMaskAccount {
        id
      }
    }
    marketplace {
      listing(id: $listingId) {
        ...basicListingFields
        events {
          id
          event
          blockNumber
          block {
            id
            timestamp
          }
          returnValues {
            ipfsHash
            party
            offerID
            listingID
          }
        }
      }
    }
  }
  ${fragments.Listing.basic}
`
