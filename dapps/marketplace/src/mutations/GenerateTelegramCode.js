import gql from 'graphql-tag'

export default gql`
  mutation GenerateTelegramCode($identity: String!) {
    generateTelegramCode(identity: $identity) {
      success
      reason
      code
    }
  }
`
