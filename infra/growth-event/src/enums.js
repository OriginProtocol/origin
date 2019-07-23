/**
 * IMPORTANT: If you add an entry to an enum below, do not forget to add
 *  a migration script to add the enum to the DB.
 */

const GrowthEventStatuses = ['Logged', 'Verified', 'Fraud']

const GrowthEventTypes = [
  'ProfilePublished',
  'EmailAttestationPublished',
  'FacebookAttestationPublished',
  'AirbnbAttestationPublished',
  'TwitterAttestationPublished',
  'PhoneAttestationPublished',
  'GoogleAttestationPublished',
  'LinkedInAttestationPublished',
  'GitHubAttestationPublished',
  'KakaoAttestationPublished',
  'WeChatAttestationPublished',
  'WebsiteAttestationPublished',
  'ListingCreated',
  'ListingPurchased', // Buyer side event.
  'ListingSold', // Seller side event.
  'MobileAccountCreated' // User installed Origin mobile app and registered an account.
]

module.exports = {
  GrowthEventStatuses,
  GrowthEventTypes
}
