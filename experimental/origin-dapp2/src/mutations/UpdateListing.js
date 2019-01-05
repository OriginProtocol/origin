import gql from 'graphql-tag'

export default gql`
  mutation UpdateListing(
    $listingID: String!
    $additionalDeposit: String
    $from: String
    $data: NewListingInput
    $autoApprove: Boolean
  ) {
    updateListing(
      listingID: $listingID
      additionalDeposit: $additionalDeposit
      from: $from
      data: $data
      autoApprove: $autoApprove
    ) {
      id
    }
  }
`
