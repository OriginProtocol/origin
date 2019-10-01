const { tokenToNaturalUnits } = require('../src/util/token')


const septemberConfig = {
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
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare11',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'meet_franck',
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
          id: 'TwitterShare12',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'rodolfo_foundation_capital',
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
          id: 'TwitterShare13',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'meet_yupan',
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
          id: 'TwitterShare14',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'origin_on_tv',
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
          id: 'TwitterShare15',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'origin_investors',
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
          id: 'FacebookShare11',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'meet_franck',
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
          id: 'FacebookShare12',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'rodolfo_foundation_capital',
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
          id: 'FacebookShare13',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'meet_yupan',
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
          id: 'FacebookShare14',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'origin_on_tv',
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
          id: 'FacebookShare15',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'origin_investors',
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
              'WebsiteAttestationPublished',
              'TelegramAttestationPublished'
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
            limit: 50,
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
    meet_franck: {
      titleKey: 'growth.share.content11.title',
      detailsKey: 'growth.share.content11.details',
      image: 'images/growth/share-content11.png',
      link: 'https://youtu.be/AQgqEKNTjFw',
      linkKey: 'growth.share.content11.link',
      post: {
        tweet: {
          default: `Watch Franck Chastagnol, Senior Engineer @OriginProtocol talk about the future of sharing economy & how to participate in #originrewards. https://youtu.be/AQgqEKNTjFw`,
          translations: [ ]
        }
      }
    },
    rodolfo_foundation_capital: {
      titleKey: 'growth.share.content12.title',
      detailsKey: 'growth.share.content12.details',
      image: 'images/growth/share-content12.png',
      link: 'https://www.originprotocol.com/video/OHRkJwdIclE',
      linkKey: 'growth.share.content12.link',
      post: {
        tweet: {
          default: `As an investor in @OriginProtocol, Foundation Capital is now betting on a better, #decentralized future for the sharing economy. https://www.originprotocol.com/en/video/OHRkJwdIclE`,
          translations: [ ]
        }
      }
    },
    meet_yupan: {
      titleKey: 'growth.share.content13.title',
      detailsKey: 'growth.share.content13.details',
      image: 'images/growth/share-content13.png',
      link: 'https://www.originprotocol.com/video/5zsz1wUFmps',
      linkKey: 'growth.share.content13.link',
      post: {
        tweet: {
          default: `Meet Yu Pan: PayPal's Co-founder, first YouTube engineer and now a R&D engineer at @OriginProtocol. https://www.originprotocol.com/video/5zsz1wUFmps`,
          translations: [ ]
        }
      }
    },
    origin_on_tv: {
      titleKey: 'growth.share.content14.title',
      detailsKey: 'growth.share.content14.details',
      image: 'images/growth/share-content14.png',
      link: 'https://medium.com/originprotocol/live-on-tv-with-hkb-news-in-korea-a6636be60eef',
      linkKey: 'growth.share.content14.link',
      post: {
        tweet: {
          default: `@OriginProtocol was live on TV with HKB News in Korea! Check out the interview in this blog post: https://medium.com/originprotocol/live-on-tv-with-hkb-news-in-korea-a6636be60eef`,
          translations: [ ]
        }
      }
    },
    origin_investors: {
      titleKey: 'growth.share.content15.title',
      detailsKey: 'growth.share.content5.details',
      image: 'images/growth/share-content15.png',
      link: 'https://www.originprotocol.com/video/tAyusRT3ZDQ',
      linkKey: 'growth.share.content15.link',
      post: {
        tweet: {
          default: `Here is why investors believe in @OriginProtocol. https://www.originprotocol.com/video/tAyusRT3ZDQ`,
          translations: [ ]
        }
      }
    },
  }
}

module.exports = septemberConfig
