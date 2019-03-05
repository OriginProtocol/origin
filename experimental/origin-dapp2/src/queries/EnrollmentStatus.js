import gql from 'graphql-tag'

export default gql`
  query EnrollmentStatus($walletAddress: ID!) {
    enrollmentStatus(walletAddress: $walletAddress)
  }
`
