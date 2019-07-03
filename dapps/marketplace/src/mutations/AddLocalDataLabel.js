import gql from 'graphql-tag'

export default gql`
  mutation AddLocalDataLabel($objectID: ID!, $label: String!) {
    addLocalDataLabel(objectID: $objectID, label: $label)
  }
`
