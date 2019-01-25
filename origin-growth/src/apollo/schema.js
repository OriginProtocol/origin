const { gql } = require('apollo-server-express')

const typeDefs = gql`
  scalar JSON

  ######################
  #
  # Query output schema.
  #
  ######################

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }

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
    reward: Price!            # information about reward
  }

  type Action implements BaseAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    reward: Price!            # information about reward
  }

  type InviteConnection {
    nodes: [Invite]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReferralAction implements BaseAction {
    type: ActionType!
    status: ActionStatus!
    rewardEarned: Price
    rewardPending: Price
    reward: Price!            # information about reward
    # first property specifies the number of items to return
    # after is the cursor
    invites(first: Int, after: String): [InviteConnection]
  }

  type Campaign {
    id: Int!
    name: String!
    startDate: String
    endDate: String
    distributionDate: String
    status: CampaignStatus!
    actions: [BaseAction]
    rewardEarned: Price!      # amount earned all actions combined
  }

  type CampaignConnection {
    nodes: [Campaign]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type InviteResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    invites: [Invite]
  }

  type EnrollResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    campaign: Campaign
  }

  type LogResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type Query {
    # first property specifies the number of items to return
    # after is the cursor
    campaigns(first: Int, after: String): CampaignConnection
    campaign(id: String): Campaign
  }

  type Mutation {
    invite(emails: [String!]!): InviteResponse
    enroll(campaignId: Int!): EnrollResponse
    log(event: JSON!): LogResponse
  }
`

module.exports = typeDefs
