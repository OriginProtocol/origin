import gql from 'graphql-tag'

export default gql`
  mutation WithdrawOffer($offerID: String!, $from: String) {
    withdrawOffer(offerID: $offerID, from: $from) {
      id
    }
  }
`
