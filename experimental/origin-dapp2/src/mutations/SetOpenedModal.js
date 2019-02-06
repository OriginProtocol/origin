import gql from 'graphql-tag'

export default gql`
  mutation SetOpenedModal($modalName: String!) {
    setOpenModal(modalName: $modalName) @client
  }
`
