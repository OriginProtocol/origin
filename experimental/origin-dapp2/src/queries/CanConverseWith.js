import gql from 'graphql-tag'

export default gql`
  query CanConverseWith($account: String!) {
    messaging(id: "defaultAccount") {
      id
      enabled
      canConverseWith(id: $account)
    }
  }
`
