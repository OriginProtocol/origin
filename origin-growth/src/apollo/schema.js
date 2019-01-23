const { gql } = require('apollo-server-express')

const typeDefs = gql`
  scalar JSON

  ######################
  #
  # Query output schema.
  #
  ######################

  enum CampaignStatus {
    pending                   #not yet started
    active
    capReached
    completed
  }

  enum ActionStatus {
    inactive
    active
    exhausted
    completed
  }

  enum ActionType {
    basicProfile
    attestations
    referral
  }

  enum InviteStatus {
    asdasd
  }

  type Price {
    currency: String!
    amount: String!
  }

  type Invite {
    status: InviteStatus!
    walletAddress: ID!
    contactName: String
    reward: Price
  }

  interface BasicAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
  }

  type Action implements BasicAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
  }

  type ReferralAction implements BasicAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
    invites: [Invite]
  }

  type Campaign {
    id: String!
    name: String!
    startDate: String
    endDate: String
    distributionDate: String
    status: CampaignStatus!
    actions: [BasicAction]
    reward: Price!            # amount earned all actions combined
  }

  type CampaignPage {
    nodes: [Campaign]
  }

  #
  # The "Query" type is the root of all GraphQL queries.
  #
  type Query {
    campaigns: CampaignPage
    campaign(id: String): Campaign

    action(id: String, actionType: ActionType): Action
    info: JSON!
  }
`

module.exports = typeDefs
