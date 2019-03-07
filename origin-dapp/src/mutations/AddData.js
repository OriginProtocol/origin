import gql from 'graphql-tag'

export default gql`
  mutation AddData(
    $data: String!
    $from: String!
    $listingID: String
    $offerID: String
  ) {
    addData(
      data: $data
      listingID: $listingID
      offerID: $offerID
      from: $from
    ) {
      id
    }
  }
`
