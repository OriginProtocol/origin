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

const GrowthEventStatuses = new Enum('Logged', 'Verified', 'Fraud')

const GrowthEventTypes = new Enum(
  'ProfilePublished',
  'EmailAttestationPublished',
  'FacebookAttestationPublished',
  'AirbnbAttestationPublished',
  'TwitterAttestationPublished',
  'PhoneAttestationPublished',
  'RefereeSignedUp',
  'ListingCreated',
  'ListingPurchased'
)

const GrowthRewardStatuses = new Enum('Pending', 'Fraud,', 'Blocked', 'Paid')

const GrowthInviteContactTypes = new Enum('Email', 'Phone', 'Other')

const GrowthInviteStatuses = new Enum('Sent', 'Visited', 'Completed')

module.exports = {
  GrowthEventStatuses,
  GrowthEventTypes,
  GrowthRewardStatuses,
  GrowthInviteContactTypes,
  GrowthInviteStatuses
}
