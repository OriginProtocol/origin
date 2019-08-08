import gql from 'graphql-tag'

export default gql`
  mutation ConfirmSocialFollow($actionType: GrowthActionType!) {
    confirmSocialFollow(actionType: $actionType)
  }
`
