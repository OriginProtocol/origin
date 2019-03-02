import gql from 'graphql-tag'

export default gql`
  mutation Enroll($accountId: ID!, $agreementMessage: String!, $signature: String!) {
    enroll(accountId: $accountId, agreementMessage: $agreementMessage, signature: $signature) {
      authToken
      error
    }
  }
`