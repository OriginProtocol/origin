import gql from 'graphql-tag'

export default gql`
  mutation GenerateTelegramCode($phone: String!) {
    generateTelegramCode(phone: $phone) {
      success
      reason
    }
  }
`
