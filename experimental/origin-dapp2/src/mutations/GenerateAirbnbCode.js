import gql from 'graphql-tag'

export default gql`
  mutation GenerateAirbnbCode($identity: String!, $airbnbUserId: String!) {
    generateAirbnbCode(identity: $identity, airbnbUserId: $airbnbUserId) {
      success
      reason
      code
    }
  }
`
