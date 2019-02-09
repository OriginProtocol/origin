import gql from 'graphql-tag'

export default gql`
  mutation UpdateListing(
    $listingID: ID!
    $from: String!
    $additionalDeposit: String
    $autoApprove: Boolean
    $data: ListingInput!
    $unitData: UnitListingInput
    $fractionalData: FractionalListingInput
  ) {
    updateListing(
      listingID: $listingID
      from: $from
      additionalDeposit: $additionalDeposit
      autoApprove: $autoApprove
      data: $data
      unitData: $unitData
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`
