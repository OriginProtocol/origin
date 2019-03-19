import gql from 'graphql-tag'

export default gql`
  query InviteInfo($code: String!) {
    inviteInfo(code: $code) {
      firstName
      lastName
    }
  }
`
