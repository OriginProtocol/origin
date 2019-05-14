import gql from 'graphql-tag'

export default gql`
  mutation DeployIdentityViaProxy($from: String!, $owner: String!) {
    deployIdentityViaProxy(from: $from, owner: $owner) {
      id
    }
  }
`
