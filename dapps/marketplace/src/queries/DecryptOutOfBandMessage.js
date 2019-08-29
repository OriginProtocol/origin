import gql from 'graphql-tag'

const DecryptOutOfBandMessage = gql`
  query DecryptOutOfBandMessage($encrypted: String!) {
    messaging(id: "defaultAccount") {
      decryptOutOfBandMessage(encrypted: $encrypted) {
        content
      }
    }
  }
`
export default DecryptOutOfBandMessage
