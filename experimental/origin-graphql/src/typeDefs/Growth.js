const Common = require('./Common')

module.exports =
  Object.values(Common).reduce((acc, item) => acc + item) +
  `
  scalar JSON
  scalar DateTime

  ###############################################
  #
  # Query output schema for Growth Apollo server.
  #
  ###############################################

  enum GrowthCampaignStatus {
    pending                   #not yet started
    active
    capReached
    completed
  }

  enum GrowthActionStatus {
    inactive
    active
    exhausted
    completed
  }

  enum GrowthActionType {
    basicProfile
    attestations
    referral
  }

  enum GrowthInviteStatus {
    pending
    successful
  }

  type Invite {
    status: GrowthInviteStatus!
    walletAddress: ID!
    contactName: String
    reward: Price
  }

  interface GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus!
    rewardEarned: Price
    reward: Price!            # information about reward
  }

  type GrowthAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus!
    rewardEarned: Price
    reward: Price!            # information about reward
  }

  type GrowthInviteConnection {
    nodes: [Invite]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReferralAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus!
    rewardEarned: Price
    rewardPending: Price
    reward: Price!            # information about reward
    # first property specifies the number of items to return
    # after is the cursor
    invites(first: Int, after: String): [GrowthInviteConnection]
  }

  type GrowthCampaign {
    id: Int!
    name: String!
    startDate: DateTime
    endDate: DateTime
    distributionDate: DateTime
    status: GrowthCampaignStatus!
    actions: [GrowthBaseAction]
    rewardEarned: Price!      # amount earned all actions combined
  }

  type GrowthCampaignConnection {
    nodes: [GrowthCampaign]
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
    campaign: GrowthCampaign
  }

  type SimpleResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type Query {
    # first property specifies the number of items to return
    # after is the cursor
    campaigns(first: Int, after: String): GrowthCampaignConnection
    campaign(id: String): GrowthCampaign
  }

  type Mutation {
    invite(emails: [String!]!): InviteResponse
    enroll(campaignId: Int!): EnrollResponse
    gasForIdentity(walletAddress: ID!): SimpleResponse
    invited(walletAddress: ID!, inviteCode: String!): SimpleResponse
    log(event: JSON!): SimpleResponse
  }
`
