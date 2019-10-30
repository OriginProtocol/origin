const { tokenToNaturalUnits } = require('../src/util/token')


const novemberConfig = {
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
            statusScope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.attestation.requirement.facebookAttestation',
                conditionIcon: 'growth.purchase.empty.details'
              }
            ]
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
            statusScope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.attestation.requirement.twitterAttestation',
                conditionIcon: 'growth.purchase.empty.details'
              }
            ]
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
          id: 'TelegramAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TelegramAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.attestation.requirement.telegram',
                conditionIcon: 'images/growth/telegram-badge.svg'
              }
            ]
          }
        },
        {
          id: 'TwitterShare16',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'anna_wang_decentralise',
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
          id: 'TwitterShare17',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'ryan_kim_hashed',
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
          id: 'TwitterShare18',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'free_as_possible',
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
          id: 'TwitterShare19',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'venezuelan_merchants_reshaping',
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
          id: 'TwitterShare20',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'coinlist_founder',
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
          id: 'FacebookShare16',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'anna_wang_decentralise',
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
          id: 'FacebookShare17',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'ryan_kim_hashed',
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
          id: 'FacebookShare18',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'free_as_possible',
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
          id: 'FacebookShare19',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'venezuelan_merchants_reshaping',
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
          id: 'FacebookShare20',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'coinlist_founder',
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
          id: 'FacebookLike',
          class: 'SingleEvent',
          config: {
            eventType: 'LikedOnFacebook',
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
          id: 'TelegramFollow',
          class: 'SingleEvent',
          config: {
            eventType: 'FollowedOnTelegram',
            additionalLockConditions: ['TelegramAttestation'],
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
          id: 'ThreeAttestations',
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
              'WebsiteAttestationPublished',
              'TelegramAttestationPublished'
            ],
            visible: false,
            numEventsRequired: 3,
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
            limit: -1,
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
              amount: tokenToNaturalUnits(100),
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
        },
        {
          id: 'ListingPurchase1-000-3197',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3197',
            reward: {
              amount: tokenToNaturalUnits(300),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3197-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3197.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3212',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3212',
            reward: {
              amount: tokenToNaturalUnits(60),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3212-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3212.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3200',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3200',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3200-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3200.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3203',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3203',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3203-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3203.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3204',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3204',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3204-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3204.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3205',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3205',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3205-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3205.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3211',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3211',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3211-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3211.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3206',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3206',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3206-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3206.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3208',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3208',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3208-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3208.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        },
        {
          id: 'ListingPurchase1-000-3209',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-000-3209',
            reward: {
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-000-3209-icon.png',
            titleKey: 'growth.purchase.listing-1-000-3209.title',
            detailsKey: 'growth.purchase.empty.details'
          }
        }
      ]
    }
  },
  twitter_share_config: {
    minAccountAgeDays: 365,
    minAgeLastTweetDays: 365,
    minFollowersThreshold: 10,
    tierFollowersThreshold: 100,
    tierFollowersIncrement: 100,
    verifiedMultiplier: 2,
    cap: 100,
  },
  content: {
    anna_wang_decentralise: {
      titleKey: 'growth.share.content16.title',
      detailsKey: 'growth.share.content16.details',
      image: 'images/growth/share-content16.png',
      link: 'https://www.originprotocol.com/video/anna-wang-decentralized-sharing-economy',
      linkKey: 'growth.share.content16.link',
      post: {
        tweet: {
          default: `In this video, @AbsolumentAnna shares her thoughts on @OriginProtocol's mission and what a #decentralized sharing economy means to her.`,
          translations: [ ]
        }
      }
    },
    ryan_kim_hashed: {
      titleKey: 'growth.share.content17.title',
      detailsKey: 'growth.share.content17.details',
      image: 'images/growth/share-content17.png',
      link: 'https://www.originprotocol.com/video/ryan-kim-hashed',
      linkKey: 'growth.share.content17.link',
      post: {
        tweet: {
          default: `Ryan Kim is a partner at @Hashed_official, the largest blockchain accelerator in Korea. In this video, Ryan shares why Hashed decided to invest in @OriginProtocol and continues to support the project today.`,
          translations: [ ]
        }
      }
    },
    free_as_possible: {
      titleKey: 'growth.share.content18.title',
      detailsKey: 'growth.share.content18.details',
      image: 'images/growth/share-content18.png',
      link: 'https://www.originprotocol.com/video/yusuke-obinata-nodetokyo',
      linkKey: 'growth.share.content18.link',
      post: {
        tweet: {
          default: `Watch @obnty, Founder of NodeTokyo sharing how @OriginProtocol maximizes freedom and allows people to buy and sell without any restrictions.`,
          translations: [ ]
        }
      }
    },
    venezuelan_merchants_reshaping: {
      titleKey: 'growth.share.content19.title',
      detailsKey: 'growth.share.content19.details',
      image: 'images/growth/share-content19.png',
      link: 'https://medium.com/originprotocol/these-venezuelan-merchants-are-reshaping-commerce-with-origin-c28e6d2169d9',
      linkKey: 'growth.share.content19.link',
      post: {
        tweet: {
          default: `Decentralized commerce can empower local communities to buy and sell freely in the emerging world. Here is a recap of @OriginProtocol's recent meetup in Venezuela.`,
          translations: [ ]
        }
      }
    },
    coinlist_founder: {
      titleKey: 'growth.share.content20.title',
      detailsKey: 'growth.share.content20.details',
      image: 'images/growth/share-content20.png',
      link: 'https://www.originprotocol.com/video/coinlist-founder-decentralized-marketplace-future',
      linkKey: 'growth.share.content20.link',
      post: {
        tweet: {
          default: `In this video, @Andy_Bromberg, Founder and President of @CoinList discusses some of the incredible new possibilities enabled by @OriginProtocol and peer-to-peer marketplaces.`,
          translations: [ ]
        }
      }
    },
  }
}

module.exports = novemberConfig
