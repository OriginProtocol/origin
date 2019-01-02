import gql from 'graphql-tag'

export default gql`
  query Notifications {
    web3 {
      metaMaskAccount {
        id
      }
    }
    notifications {
      totalCount
      totalUnread
      nodes {
        id
        title
        timestamp
        content
      }
    }
  }
`
