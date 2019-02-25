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

const GrowthEventStatuses = new Enum('Logged', 'Verified', 'Fraud')

const GrowthEventTypes = new Enum(
  'AcceptedTerms', // User accepted terms of the reward program.
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

const GrowthInviteStatuses = new Enum('Sent', 'Visited', 'Completed')

module.exports = {
  GrowthCampaignRewardStatuses,
  GrowthEventStatuses,
  GrowthEventTypes,
  GrowthParticipantStatuses,
  GrowthRewardStatuses,
  GrowthInviteContactTypes,
  GrowthInviteStatuses
}
