import gql from 'graphql-tag'

export default gql`
  mutation GenerateWebsiteCode($identity: String!, $website: String!) {
    generateWebsiteCode(identity: $identity, website: $website) {
      success
      reason
      code
    }
  }
`
