import gql from 'graphql-tag'

export default gql`
  mutation FinalizeOffer(
    $offerID: String!
    $from: String
    $rating: Int
    $review: String
  ) {
    finalizeOffer(
      offerID: $offerID
      from: $from
      rating: $rating
      review: $review
    ) {
      id
    }
  }
`
