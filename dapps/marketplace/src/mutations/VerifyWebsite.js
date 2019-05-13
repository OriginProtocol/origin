import gql from 'graphql-tag'

export default gql`
  mutation VerifyWebsite($identity: String!, $website: String!) {
    verifyWebsite(identity: $identity, website: $website) {
      success
      reason
      data
    }
  }
`
