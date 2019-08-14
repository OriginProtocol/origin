import gql from 'graphql-tag'

export default gql`
  mutation VerifyTelegramCode($identity: String!, $code: String!) {
    verifyTelegramCode(identity: $identity, code: $code) {
      success
      reason
      data
    }
  }
`
