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
  'GoogleAttestationPublished',
  'LinkedInAttestationPublished',
  'GitHubAttestationPublished',
  'KakaoAttestationPublished',
  'WeChatAttestationPublished',
  'WebsiteAttestationPublished',
  'ListingCreated',
  'ListingPurchased', // Buyer side event.
  'ListingSold', // Seller side event.
  'MobileAccountCreated', // User installed Origin mobile app and registered an account.
  'SharedOnTwitter',
  'FollowedOnTwitter',
  'FollowedOnTelegram',
  'TelegramAttestationPublished',
  'SharedOnFacebook',
  'LikedOnFacebook'
)

module.exports = {
  Enum,
  GrowthEventStatuses,
  GrowthEventTypes
}
