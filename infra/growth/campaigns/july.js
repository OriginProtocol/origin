const { tokenToNaturalUnits } = require('../src/util/token')


const mayConfig = {
  numLevels: 3,
  levels: {
    0: {
      rules: [
        {
          id: 'ProfilePublished',
          class: 'SingleEvent',
          config: {
            eventType: 'ProfilePublished',
            reward: null,
            nextLevelCondition: false,
            visible: true,
            scope: 'user'
          }
        },
        {
          id: 'EmailAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'EmailAttestationPublished',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'user'
          }
        },
        {
          id: 'BothRules',
          class: 'MultiEvents',
          config: {
            eventTypes: ['ProfilePublished', 'EmailAttestationPublished'],
            visible: false,
            numEventsRequired: 2,
            reward: null,
            nextLevelCondition: true,
            scope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.profile.requirement',
                conditionIcon: 'images/growth/email-icon-small.svg'
              },
              {
                conditionTranslateKey: 'growth.email.requirement',
                conditionIcon: 'images/growth/email-icon-small.svg'
              }
            ]
          }
        }
      ]
    },
    1: {
      rules: [
        {
          id: 'PhoneAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'PhoneAttestationPublished',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'FacebookAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'AirbnbAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'AirbnbAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TwitterAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'GoogleAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'GoogleAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'GitHubAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'GitHubAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'LinkedInAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'LinkedInAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'KakaoAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'KakaoAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'WeChatAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'WeChatAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'WebsiteAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'WebsiteAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwoAttestations',
          class: 'MultiEvents',
          config: {
            eventTypes: [
              'PhoneAttestationPublished',
              'FacebookAttestationPublished',
              'AirbnbAttestationPublished',
              'TwitterAttestationPublished',
              'GoogleAttestationPublished',
              'GitHubAttestationPublished',
              'LinkedInAttestationPublished',
              'KakaoAttestationPublished',
              'WeChatAttestationPublished',
              'WebsiteAttestationPublished'
            ],
            visible: false,
            numEventsRequired: 2,
            reward: null,
            nextLevelCondition: true,
            scope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.two.attestations.requirement',
                conditionIcon: 'images/growth/attestation-icon.svg'
              }
            ]
          }
        }
      ]
    },
    2: {
      rules: [
        {
          id: 'Referral',
          class: 'Referral',
          config: {
            levelRequired: 2,
            reward: {
              amount: tokenToNaturalUnits(50),
              currency: 'OGN'
            },
            limit: 25,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign'
          }
        },
        {
          id: 'MobileAccountCreated',
          class: 'SingleEvent',
          config: {
            eventType: 'MobileAccountCreated',
            reward: {
              amount: tokenToNaturalUnits(150),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        // GREATER CHINA - TODO: ADD MORE LISTINGS
        {
          id: 'ListingPurchase2867',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2867',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing2867-icon.png',
            titleKey: 'growth.purchase.listing2867.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        // KOREA - TODO: ADD MORE LISTINGS
        {
          id: 'ListingPurchase2865',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2865',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing2865-icon.png',
            titleKey: 'growth.purchase.listing2865.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase2866',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2866',
            reward: {
              amount: tokenToNaturalUnits(20),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing2867-icon.png',
            titleKey: 'growth.purchase.listing2867.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        // RUSSIA - TODO: ADD MORE LISTINGS
        {
          id: 'ListingPurchase679',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-679',
            reward: {
              amount: tokenToNaturalUnits(500),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing679-icon.png',
            titleKey: 'growth.purchase.listing679.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase2555',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2555',
            reward: {
              amount: tokenToNaturalUnits(250),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing2555-icon.png',
            titleKey: 'growth.purchase.listing2555.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1103',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-1103',
            reward: {
              amount: tokenToNaturalUnits(20),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing1103-icon.png',
            titleKey: 'growth.purchase.listing1103.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase2812',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2812',
            reward: {
              amount: tokenToNaturalUnits(15),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing2812-icon.png',
            titleKey: 'growth.purchase.listing2812.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase866',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-866',
            reward: {
              amount: tokenToNaturalUnits(15),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing866-icon.png',
            titleKey: 'growth.purchase.listing866.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase297',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-297',
            reward: {
              amount: tokenToNaturalUnits(500),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing297-icon.png',
            titleKey: 'growth.purchase.listing297.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase289',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-289',
            reward: {
              amount: tokenToNaturalUnits(500),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing289-icon.png',
            titleKey: 'growth.purchase.listing289.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase639',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-639',
            reward: {
              amount: tokenToNaturalUnits(20),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing639-icon.png',
            titleKey: 'growth.purchase.listing639.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase471',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-471',
            reward: {
              amount: tokenToNaturalUnits(20),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing471-icon.png',
            titleKey: 'growth.purchase.listing471.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase292',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-292',
            reward: {
              amount: tokenToNaturalUnits(500),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing292-icon.png',
            titleKey: 'growth.purchase.listing292.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
      ]
    }
  }
}

module.exports = mayConfig