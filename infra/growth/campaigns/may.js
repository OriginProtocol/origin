const tokenNaturalUnits = require('../src/util/token')


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
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
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
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
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
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
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
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
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
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
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
              'GoogleAttestationPublished'
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
              amount: tokenNaturalUnits(50),
              currency: 'OGN'
            },
            limit: 25,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign'
          }
        },
        {
          id: 'ListingPurchaseTShirt',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2554',
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-tshirt-icon.svg',
            titleKey: 'growth.purchase.tshirt.title',
            detailsKey: 'growth.purchase.tshirt.details'
          }
        },
        {
          id: 'ListingPurchaseGC',
          class: 'ListingIdPurchase',
          config: {
            listingId: '1-000-2553',
            reward: {
              amount: tokenNaturalUnits(50),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-gc-icon.svg',
            titleKey: 'growth.purchase.gc.title',
            detailsKey: 'growth.purchase.gc.details'
          }
        },
        {
          id: 'ListingPurchaseCharity',
          class: 'ListingIdPurchase',
          config: {
            listingId: '1-000-2555',
            reward: {
              amount: tokenNaturalUnits(300),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-charity-icon.svg',
            titleKey: 'growth.purchase.charity.title',
            detailsKey: 'growth.purchase.charity.details'
          }
        },
        {
          id: 'ListingPurchaseHousing',
          class: 'ListingIdPurchase',
          config: {
            listingId: '1-000-2543',
            reward: {
              amount: tokenNaturalUnits(750),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-housing-icon.svg',
            titleKey: 'growth.purchase.homerental.title',
            detailsKey: 'growth.purchase.homerental.details'
          }
        },
        {
          id: 'ListingPurchaseInfluencer',
          class: 'ListingIdPurchase',
          config: {
            listingId: '1-000-5',
            reward: {
              amount: tokenNaturalUnits(1250),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-experience-icon.svg',
            titleKey: 'growth.purchase.experience.title',
            detailsKey: 'growth.purchase.experience.details'
          }
        },
        {
          id: 'ListingPurchaseArt',
          class: 'ListingIdPurchase',
          config: {
            listingId: '1-000-503',
            reward: {
              amount: tokenNaturalUnits(20000),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/purchase-art-icon.svg',
            titleKey: 'growth.purchase.art.title',
            detailsKey: 'growth.purchase.art.details'
          }
        }
      ]
    }
  }
}

module.exports = mayConfig