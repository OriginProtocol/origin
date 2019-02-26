import gql from 'graphql-tag'

export default gql`
  mutation WithdrawListing(
    $listingID: String!
    $target: String!
    $from: String
  ) {
    withdrawListing(listingID: $listingID, target: $target, from: $from) {
      id
    }
  }
`
