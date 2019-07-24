import gql from 'graphql-tag'

 export default gql`
  mutation VerifyPromotion(
    $identity: String!
    $type: String
    $socialNetwork: String
    $content: String
  ) {
    verifyPromotion(
      identity: $identity
      type: $type
      socialNetwork: $socialNetwork
      content: $content
    ) {
      success
      reason
      data
    }
  }
`
