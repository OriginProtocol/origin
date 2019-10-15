import gql from 'graphql-tag'

export default gql`
  query CanConverseWith($account: String!) {
    messaging(id: "defaultAccount") {
      id
      enabled
      isKeysLoading
      canConverseWith(id: $account)
      forwardTo(id: $account)
    }
  }
`
