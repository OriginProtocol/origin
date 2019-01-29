import gql from 'graphql-tag'

export default gql`
  mutation UpdateConfig(
    $from: String,
    $to: String
  ) {
    updateConfig(
      from: $from,
      to: $to
    ) {
      id
    }
  }
`
