import gql from 'graphql-tag'

export default gql`
  mutation VerifyPromotion(
    $identity: String!
    $identityProxy: String
    $type: String
    $socialNetwork: String
    $content: String
  ) {
    verifyPromotion(
      identity: $identity
      identityProxy: $identityProxy
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
