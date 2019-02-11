import gql from 'graphql-tag'

export default gql`
  mutation VerifyAirbnbCode($identity: String!, $airbnbUserId: String!) {
    verifyAirbnbCode(identity: $identity, airbnbUserId: $airbnbUserId) {
      success
      reason
      data
    }
  }
`
