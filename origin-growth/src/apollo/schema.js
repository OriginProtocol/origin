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
    pending
    successful
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

  interface BaseAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
  }

  type Action implements BaseAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
  }

  type ReferralAction implements BaseAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price      # applicable for referral action
    rewardInfo: Price!        # information about reward
    invites: [Invite]         # TODO: might we need pagination for invites?
  }

  type Campaign {
    id: String!
    name: String!
    startDate: String
    endDate: String
    distributionDate: String
    status: CampaignStatus!
    actions: [BaseAction]
    reward: Price!            # amount earned all actions combined
  }

  # in case we need any sort of pagination in the future
  type CampaignPage {
    nodes: [Campaign]
  }

  type Query {
    campaigns: CampaignPage
    campaign(id: String): Campaign
  }
`

module.exports = typeDefs
