import gql from 'graphql-tag'

export default gql`
  mutation CreateListing(
    $deposit: String
    $depositManager: String
    $from: String
    $data: NewListingInput
    $autoApprove: Boolean
  ) {
    createListing(
      deposit: $deposit
      depositManager: $depositManager
      from: $from
      data: $data
      autoApprove: $autoApprove
    ) {
      id
    }
  }
`
