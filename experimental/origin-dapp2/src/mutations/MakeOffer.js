import gql from 'graphql-tag'

export default gql`
  mutation MakeOffer(
    $listingID: String!
    $value: String!
    $from: String
    $quantity: Int!
    $fractionalData: FractionalOfferInput
  ) {
    makeOffer(
      listingID: $listingID
      value: $value
      from: $from
      quantity: $quantity
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`
