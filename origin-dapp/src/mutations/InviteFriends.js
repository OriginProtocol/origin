import gql from 'graphql-tag'

export default gql`
  mutation invite($emails: [String!]!) {
    invite(emails: $emails)
  }
`
