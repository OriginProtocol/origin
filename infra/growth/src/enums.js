/**
 * IMPORTANT: If you add an entry to an enum below, do not forget to add
 *  a migration script to add the enum to the DB.
 */

class Enum extends Array {
  constructor(...args) {
    super(...args)

    for (const k of args) {
      this[k] = k
    }
  }
}

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
  'ListingPurchased'
)

const GrowthEventStatuses = new Enum('Logged', 'Verified', 'Fraud')

const GrowthEventTypes = new Enum(
  'ProfilePublished',
  'EmailAttestationPublished',
  'FacebookAttestationPublished',
  'AirbnbAttestationPublished',
  'TwitterAttestationPublished',
  'PhoneAttestationPublished',
  'GoogleAttestationPublished',
  'ListingCreated',
  'ListingPurchased', // Buyer side event.
  'ListingSold' // Seller side event.
)

const GrowthParticipantStatuses = new Enum('Active', 'Banned')

const GrowthParticipantAuthenticationStatus = new Enum(
  'Enrolled',
  'Banned',
  'NotEnrolled'
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
  GrowthInviteContactTypes,
  GrowthInviteStatuses,
  GrowthCampaignStatuses,
  GrowthActionStatus,
  GrowthActionType
}
