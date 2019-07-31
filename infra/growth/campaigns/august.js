const { tokenToNaturalUnits } = require('../src/util/token')


const augustConfig = {
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
          id: 'LinkedInAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'LinkedInAttestationPublished',
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
          id: 'KakaoAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'KakaoAttestationPublished',
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
          id: 'WebsiteAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'WebsiteAttestationPublished',
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
          id: 'TwitterShare1',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            content: {
              titleKey: 'growth.twitterShare.content1.title',
              detailsKey: 'growth.twitterShare.content1.details',
              image: 'images/growth/twitter-share-content1.png',
              link: 'https://medium.com/originprotocol/now-optimized-for-mobile-origin-launches-a-fresh-new-app-and-sponsored-gas-80dc2407bd8d',
              linkKey: 'growth.twitterShare.content1.link',
              post: {
                text: {
                  default: `Experience the decentralised global #marketplace of the future with @OriginProtocol's fresh new app. Secure transactions. Zero fees. Try it now: http://ogn.dev/mobile`,
                  translations: [
                    { locale: 'fr_FR', text: `Experience la decentralization avec l'appli de @OriginProtocol` },
                    { locale: 'zh_CN', text: `我不知道我在说什么 @OriginProtocol` }
                  ]
                }
              }
            },
            reward: {
              amount: '0',
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
          id: 'TwitterShare2',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            content: {
              titleKey: 'growth.twitterShare.content2.title',
              detailsKey: 'growth.twitterShare.content2.details',
              image: 'images/growth/twitter-share-content2.png',
              link: 'https://medium.com/p/e36a349e5cf1/edit',
              linkKey: 'growth.twitterShare.content2.link',
              post: {
                text: {
                  default: `Join @OriginProtocol's #rewards program and earn free Origin tokens! 250,000 OGN already distributed to thousands all around the world and we're still welcoming more to become token holders`,
                  translations: [
                    { locale: 'fr_FR', text: `Venez gagner pleins de tokens avec @OriginProtocol!` },
                    { locale: 'zh_CN', text: `我不知道我在说什么 @OriginProtocol` }
                  ]
                }
              }
            },
            reward: {
              amount: '0',
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
          id: 'TwitterFollow',
          class: 'SingleEvent',
          config: {
            eventType: 'FollowedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
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
        {
          id: 'ListingPurchase1-000-2991',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2991',
            reward: {
              amount: tokenToNaturalUnits(80),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2991-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2991.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2959',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2959',
            reward: {
              amount: tokenToNaturalUnits(80),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2959-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2959.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2871',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2871',
            reward: {
              amount: tokenToNaturalUnits(80),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2871-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2871.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2854',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2854',
            reward: {
              amount: tokenToNaturalUnits(130),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2854-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2854.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2783',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2783',
            reward: {
              amount: tokenToNaturalUnits(200),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2783-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2783.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2782',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2782',
            reward: {
              amount: tokenToNaturalUnits(500),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2782-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2782.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2769',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2769',
            reward: {
              amount: tokenToNaturalUnits(50),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2769-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2769.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2760',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2760',
            reward: {
              amount: tokenToNaturalUnits(90),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2760-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2760.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2781',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2781',
            reward: {
              amount: tokenToNaturalUnits(200),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2781-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2781.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2699',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2699',
            reward: {
              amount: tokenToNaturalUnits(350),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2699-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2699.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2912',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2912',
            reward: {
              amount: tokenToNaturalUnits(75),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2912-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2912.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2892',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2892',
            reward: {
              amount: tokenToNaturalUnits(75),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2892-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2892.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-292',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-292',
            reward: {
              amount: tokenToNaturalUnits(700),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-292-icon.png',
            titleKey: 'growth.purchase.listing-1-000-292.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-60',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-60',
            reward: {
              amount: tokenToNaturalUnits(600),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-60-icon.png',
            titleKey: 'growth.purchase.listing-1-000-60.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2877',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2877',
            reward: {
              amount: tokenToNaturalUnits(700),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2877-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2877.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-2999',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-2999',
            reward: {
              amount: tokenToNaturalUnits(40),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-2999-icon.png',
            titleKey: 'growth.purchase.listing-1-000-2999.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        }
      ]
    }
  }
}

module.exports = augustConfig