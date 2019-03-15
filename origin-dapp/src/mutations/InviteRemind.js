import gql from 'graphql-tag'

export default gql`
  mutation inviteRemind($invitationId: Int!) {
    inviteRemind(invitationId: $invitationId)
  }
`
