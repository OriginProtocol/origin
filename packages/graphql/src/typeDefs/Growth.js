const Common = require('./Common')

module.exports = `
  ${Common}

  scalar JSON
  scalar DateTime

  ###############################################
  #
  # Query output schema for Growth Apollo server.
  #
  ###############################################

  enum GrowthCampaignStatus {
    Pending                   #not yet started
    Active
    CapReached
    Completed
  }

  enum GrowthActionStatus {
    Inactive
    Active
    Exhausted
    Completed
  }

  enum GrowthActionType {
    Email
    Phone
    Twitter
    Airbnb
    Facebook
    Google
    Website
    MobileAccountCreated
    Kakao
    WeChat
    GitHub
    LinkedIn
    Referral
    Profile
    ListingCreated
    ListingPurchased
    ListingIdPurchased
    ListingSold
    TwitterShare
    TwitterFollow
    Telegram
    TelegramFollow
    FacebookShare
    FacebookLike
    PartnerReferral,
    BrowserExtensionInstall
  }

  enum GrowthInviteStatus {
    Pending
    Completed
  }

  enum Eligibility {
    Unknown
    Eligible
    Restricted
    Forbidden
  }

  enum EnrollmentStatus {
    Enrolled
    NotEnrolled
    Banned
    Closed
  }

  # TODO: use Common.Price
  type GrowthPrice {
    currency: String
    amount: String
  }

  type Invite {
    # only pending invites require an ID - for remind functionality
    pendingId: ID
    status: GrowthInviteStatus!
    walletAddress: ID
    # email or firstName + lastName of the contact
    contact: String
    reward: GrowthPrice
  }

  type InviteInfo {
    firstName: String
    lastName: String
    avatarURL: String
  }

  type UnlockCondition {
    messageKey: String!
    iconSource: String!
  }

  interface GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus
    rewardEarned: GrowthPrice
    reward: GrowthPrice            # information about reward
    unlockConditions: [UnlockCondition]
    conditionalName: String
  }

  type GrowthAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus
    rewardEarned: GrowthPrice
    reward: GrowthPrice            # information about reward
    unlockConditions: [UnlockCondition]
    conditionalName: String
  }

  type GrowthInviteConnection {
    nodes: [Invite]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReferralAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus
    rewardEarned: GrowthPrice
    rewardPending: GrowthPrice
    reward: GrowthPrice            # information about reward
    limit: Int!     # limit the number of total possible referrals
    # first property specifies the number of items to return
    # after is the cursor
    invites(first: Int, after: String): GrowthInviteConnection
    unlockConditions: [UnlockCondition]
    conditionalName: String
  }

  type ListingIdPurchasedAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus
    rewardEarned: GrowthPrice
    reward: GrowthPrice
    unlockConditions: [UnlockCondition]
    conditionalName: String
    listingId: String!
    titleKey: String
    detailsKey: String
    title: String
    details: String
    iconSrc: String!
  }

  type LocaleTextPair {
    locale: String!
    text: String!
  }

  type TranslatedText {
    default: String! # Default translation. Typically in english.
    translations: [ LocaleTextPair ]
  }

  type Post {
    tweet: TranslatedText!
  }

  type SocialContent {
    id: String!
    titleKey: String!
    detailsKey: String!
    image: String!
    link: String!
    linkKey: String!
    post: Post
  }

  type SocialShareAction implements GrowthBaseAction {
    type: GrowthActionType!
    status: GrowthActionStatus
    rewardEarned: GrowthPrice
    reward: GrowthPrice
    unlockConditions: [UnlockCondition]
    conditionalName: String
    content: SocialContent
  }

  type GrowthCampaign {
    id: Int!
    nameKey: String!
    shortNameKey: String!
    startDate: DateTime
    endDate: DateTime
    distributionDate: DateTime
    status: GrowthCampaignStatus!
    actions: [GrowthBaseAction]
    rewardEarned: GrowthPrice      # amount earned all actions combined
  }

  type GrowthCampaignConnection {
    nodes: [GrowthCampaign]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type EligibilityInfo {
    eligibility: Eligibility
    countryName: String
    countryCode: String
  }

  type EnrollResponse {
    authToken: String
    isBanned: Boolean
  }

  extend type Query {
    # first property specifies the number of items to return
    # after is the cursor
    campaigns(first: Int, after: String): GrowthCampaignConnection
    campaign(id: String): GrowthCampaign
    inviteInfo(code: String!): InviteInfo
    inviteCode: String!
    isEligible: EligibilityInfo
    enrollmentStatus(walletAddress: ID!): EnrollmentStatus!
    telegramGroupName: String
  }

  extend type Mutation {
    # Sends email invites with referral code on behalf of the referrer.
    invite(emails: [String!]!): Boolean
    # Enrolls user into the growth engine program.
    enroll(agreementMessage: String!, inviteCode: String, fingerprintData: JSON): EnrollResponse
    # Records a growth engine event.
    log(event: JSON!): Boolean
    # Remind a user that his invitation is still pending
    inviteRemind(invitationId: Int!): Boolean
    # Log executing social share
    logSocialShare(contentId: String!, actionType: GrowthActionType!): Boolean
    # Log executing social follow
    logSocialFollow(actionType: GrowthActionType!): Boolean
  }
`
