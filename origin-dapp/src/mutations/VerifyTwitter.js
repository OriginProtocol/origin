import gql from 'graphql-tag'

export default gql`
  mutation VerifyTwitter($identity: String!) {
    verifyTwitter(identity: $identity) {
      success
      reason
      data
    }
  }
`
