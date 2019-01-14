import gql from 'graphql-tag'

export default gql`
  mutation VerifyFacbook($identity: String!) {
    verifyFacebook(identity: $identity) {
      success
      reason
      claimType
      data
      signature
    }
  }
`
