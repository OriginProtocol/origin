import gql from 'graphql-tag'

export default gql`
  mutation SignMessage($address: ID!, $message: String!) {
    signMessage(address: $address, message: $message)
  }
`
