import gql from 'graphql-tag'

export default gql`
  mutation DisputeOffer($offerID: String!, $from: String) {
    disputeOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`
