/**
 * IMPORTANT: If you add an entry to an enum below, do not forget to add
 *  a migration script to add the enum to the DB.
 */

const {
  Enum,
  GrowthEventStatuses,
  GrowthEventTypes
} = require('@origin/growth-event/src/enums')

const GrowthCampaignRewardStatuses = new Enum(
  'NotReady',
  'ReadyForCalculation',
  'Calculated',
  'Distributed'
)

const GrowthCampaignStatuses = new Enum(
  'Pending',
  'Active',
  'CapReached',
  'Completed'
)

const GrowthActionStatus = new Enum(
  'Inactive',
  'Active',
  'Exhausted',
  'Completed'
)

const GrowthActionType = new Enum(
  'Profile',
  'Email',
  'Phone',
  'Twitter',
  'Airbnb',
  'Facebook',
  'Google',
  'Referral',
  'ListingCreated',
  'ListingPurchased',
  'TwitterFollow',
  'TwitterShare',
  'FacebookLike',
  'FacebookShare',
  'TelegramFollow'
)

// Active: account is active.
// Banned: account was banned by our fraud scripts.
// Closed: account was closed per the user request (and in most cases user opened a new account).
const GrowthParticipantStatuses = new Enum('Active', 'Banned', 'Closed')

const GrowthParticipantAuthenticationStatus = new Enum(
  'Enrolled',
  'Banned',
  'NotEnrolled',
  'Closed'
)

// DEPRECATED. Do not use.
const GrowthRewardStatuses = new Enum(
  'Pending',
  'Fraud,',
  'Blocked',
  'InPayment',
  'Paid',
  'PaymentFailed',
  'PaidConfirmed'
)

const GrowthPayoutStatuses = new Enum(
  'Pending', // Payout transaction submitted to the blockchain
  'Paid', // Transaction receipt received from blokchain.
  'Confirmed', // Transaction confirmed.
  'Failed' // Transaction failed. Should be retried.
)

const GrowthPayoutTypes = new Enum(
  'CampaignDistribution', // Payout part of regular campaign distribution.
  'Adjustment' // Payout part of a manual adjustment. The data column should include details about the reason.
)

const GrowthInviteContactTypes = new Enum('Email', 'Phone', 'Other')

// currently Completed state is not used in the database.
const GrowthInviteStatuses = new Enum('Sent', 'Completed')

module.exports = {
  GrowthCampaignRewardStatuses,
  GrowthEventStatuses,
  GrowthEventTypes,
  GrowthParticipantStatuses,
  GrowthParticipantAuthenticationStatus,
  GrowthRewardStatuses,
  GrowthPayoutStatuses,
  GrowthPayoutTypes,
  GrowthInviteContactTypes,
  GrowthInviteStatuses,
  GrowthCampaignStatuses,
  GrowthActionStatus,
  GrowthActionType
}
