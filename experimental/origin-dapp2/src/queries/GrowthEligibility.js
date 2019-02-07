import gql from 'graphql-tag'
import fragments from './Fragments'

export default gql`
query GrowthEligibility {
  isEligible {
    code
    success
    message
    eligibility
    countryName
    countryCode
  }
}
`
