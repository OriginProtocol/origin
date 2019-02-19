import gql from 'graphql-tag'

export default gql`
  mutation GenerateEmailCode($email: String!) {
    generateEmailCode(email: $email) {
      success
      reason
    }
  }
`
