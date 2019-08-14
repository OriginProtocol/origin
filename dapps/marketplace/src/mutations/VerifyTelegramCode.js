import gql from 'graphql-tag'

export default gql`
  mutation VerifyTelegramCode($identity: String!) {
    verifyTelegramCode(identity: $identity) {
      success
      reason
      data
    }
  }
`
