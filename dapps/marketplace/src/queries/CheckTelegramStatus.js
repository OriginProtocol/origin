import gql from 'graphql-tag'

export default gql`
  query CheckTelegramStatus($identity: String!) {
    checkTelegramStatus(identity: $identity) {
      success
      reason
      data {
        attestation
        verified
      }
    }
  }
`
