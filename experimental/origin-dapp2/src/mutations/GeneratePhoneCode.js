import gql from 'graphql-tag'

export default gql`
  mutation GeneratePhoneCode(
    $prefix: String!
    $method: String
    $phone: String!
  ) {
    generatePhoneCode(prefix: $prefix, method: $method, phone: $phone) {
      success
      reason
    }
  }
`
