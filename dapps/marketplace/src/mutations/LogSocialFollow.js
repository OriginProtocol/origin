import gql from 'graphql-tag'

export default gql`
  mutation LogSocialFollow($actionType: GrowthActionType!) {
    logSocialFollow(actionType: $actionType)
  }
`
