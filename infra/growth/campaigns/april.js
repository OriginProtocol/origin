const { tokenToNaturalUnits } = require('../src/util/token')


const aprilConfig = {
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
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'user'
          }
        },
        {
          id: 'FacebookAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'FacebookAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'user'
          }
        },
        {
          id: 'AirbnbAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'AirbnbAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'user'
          }
        },
        {
          id: 'TwitterAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TwitterAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'user'
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
              'TwitterAttestationPublished'
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
          id: 'ListingSold',
          class: 'SingleEvent',
          config: {
            eventType: 'ListingSold',
            reward: {
              amount: tokenToNaturalUnits(100),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'campaign'
          }
        },
        {
          id: 'ListingPurchase',
          class: 'SingleEvent',
          config: {
            eventType: 'ListingPurchased',
            reward: {
              amount: tokenToNaturalUnits(100),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false,
            scope: 'campaign'
          }
        }
      ]
    }
  }
}

module.exports = aprilConfig