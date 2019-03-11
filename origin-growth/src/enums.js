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

const GrowthRewardStatuses = new Enum(
  'Pending',
  'Fraud,',
  'Blocked',
  'InPayment',
  'Paid',
  'PaymentFailed',
  'PaidConfirmed'
)

const GrowthInviteContactTypes = new Enum('Email', 'Phone', 'Other')

const GrowthInviteStatuses = new Enum('Sent', 'Completed')

module.exports = {
  GrowthCampaignRewardStatuses,
  GrowthEventStatuses,
  GrowthEventTypes,
  GrowthParticipantStatuses,
  GrowthParticipantAuthenticationStatus,
  GrowthRewardStatuses,
  GrowthInviteContactTypes,
  GrowthInviteStatuses,
  GrowthCampaignStatuses,
  GrowthActionStatus,
  GrowthActionType
}
