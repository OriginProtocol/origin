import gql from 'graphql-tag'

export default gql`
  mutation LogSocialShare($contentId: String!, $actionType: GrowthActionType!) {
    logSocialShare(contentId: $contentId, actionType: $actionType)
  }
`
