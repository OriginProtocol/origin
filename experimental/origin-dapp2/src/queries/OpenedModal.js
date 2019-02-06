import gql from 'graphql-tag'

export default gql`
  query GetOpenedModals {
    modal @client {
      openedModal
    }
  }
`
