import gql from 'graphql-tag'

export default gql`
  query GrowthEligibility {
    isEligible {
      eligibility
      countryName
      countryCode
    }
  }
`
