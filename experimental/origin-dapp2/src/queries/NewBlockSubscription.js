import gql from 'graphql-tag'

export default gql`
  subscription onNewBlock {
    newBlock {
      id
      number
    }
  }
`
