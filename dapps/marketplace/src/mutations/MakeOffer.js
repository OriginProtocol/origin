import gql from 'graphql-tag'

export default gql`
  mutation MakeOffer(
    $listingID: String!
    $value: String!
    $from: String
    $quantity: Int!
    $currency: String
    $fractionalData: FractionalOfferInput
  ) {
    makeOffer(
      listingID: $listingID
      value: $value
      from: $from
      quantity: $quantity
      currency: $currency
      fractionalData: $fractionalData
    ) {
      id
    }
  }
`
