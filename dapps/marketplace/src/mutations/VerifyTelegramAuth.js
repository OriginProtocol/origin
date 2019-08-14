import gql from 'graphql-tag'

export default gql`
  mutation VerifyTelegramAuth(
    $identity: String!
    $hash: String!
    $authDate: String!
    $username: String
    $firstName: String
    $lastName: String
    $id: String!
    $photoUrl: String
  ) {
    verifyTelegramAuth(
      identity: $identity
      hash: $hash
      authDate: $authDate
      username: $username
      firstName: $firstName
      lastName: $lastName
      id: $id
      photoUrl: $photoUrl
    ) {
      success
      reason
      data
    }
  }
`
