import gql from 'graphql-tag'

export default gql`
  mutation AcceptOffer($offerID: String!, $from: String) {
    acceptOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`
