import gql from 'graphql-tag'

export default gql`
  mutation CreateListing(
    $from: String!
    $deposit: String
    $depositManager: String
    $autoApprove: Boolean
    $data: ListingInput!
    $unitData: UnitListingInput
    $fractionalData: FractionalListingInput
  ) {
    createListing(
      from: $from
      deposit: $deposit
      depositManager: $depositManager
      autoApprove: $autoApprove
      data: $data
      unitData: $unitData
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`
