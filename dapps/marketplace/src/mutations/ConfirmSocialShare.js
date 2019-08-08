import gql from 'graphql-tag'

export default gql`
  mutation ConfirmSocialShare(
    $contentId: String!
    $actionType: GrowthActionType!
  ) {
    confirmSocialShare(contentId: $contentId, actionType: $actionType)
  }
`
