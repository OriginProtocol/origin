import gql from 'graphql-tag'

export default gql`
  query CheckTelegramStatus($identity: String!, $maxTries: Int) {
    checkTelegramStatus(identity: $identity, maxTries: $maxTries) {
      success
      reason
      data {
        attestation
        verified
      }
    }
  }
`
