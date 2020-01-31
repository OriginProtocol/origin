const feb2020Config = {
  numLevels: 2,
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
            reward: null,
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
          id: 'TwitterAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TwitterAttestationPublished',
            reward: null,
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
          id: 'KakaoAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'KakaoAttestationPublished',
            reward: null,
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
            reward: null,
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
          id: 'TwitterShare35',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'hkb',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare36',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'binance',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare37',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'ogn',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare38',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'commission',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare39',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'hunt',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare40',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'evan',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare35',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'hkb',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare36',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'binance',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare37',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'ogn',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare38',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'commission',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare39',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'hunt',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare40',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'evan',
            reward: null,
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
            reward: null,
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
            reward: null,
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
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'Referral',
          class: 'Referral',
          config: {
            levelRequired: 1,
            reward: null,
            limit: -1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign'
          }
        }
      ]
    }
  },
  twitter_share_config: {
    minAccountAgeDays: 0,
    minAgeLastTweetDays: 0,
    minFollowersThreshold: 0,
    tierFollowersThreshold: 0,
    tierFollowersIncrement: 0,
    verifiedMultiplier: 0,
    cap: 0,
  },
  content: {
    hkb: {
      titleKey: 'growth.share.content35.title',
      detailsKey: 'growth.share.content35.details',
      image: 'images/growth/share-content35.png',
      link: 'https://medium.com/originprotocol/origin-founders-on-tv-with-hkb-news-in-korea-38d588a7ff19',
      linkKey: 'growth.share.content35.link',
      post: {
        tweet: {
          default: `Co-founders of @originprotocol were interviewed by HKB News, one of the top blockchain media outlets in Korea. https://medium.com/originprotocol/origin-founders-on-tv-with-hkb-news-in-korea-38d588a7ff19`,
          translations: [ ]
        }
      }
    },
    binance: {
      titleKey: 'growth.share.content36.title',
      detailsKey: 'growth.share.content36.details',
      image: 'images/growth/share-content36.png',
      link: 'https://medium.com/originprotocol/origin-tokens-ogn-now-trading-on-binance-5c6dc5103e8',
      linkKey: 'growth.share.content36.link',
      post: {
        tweet: {
          default: `The @originprotocol 1.0 Platform is live! $OGN is now actively trading on @binance. https://medium.com/originprotocol/origin-tokens-ogn-now-trading-on-binance-5c6dc5103e`,
          translations: [ ]
        }
      }
    },
    ogn: {
      titleKey: 'growth.share.content37.title',
      detailsKey: 'growth.share.content37.details',
      image: 'images/growth/share-content37.png',
      link: 'https://medium.com/originprotocol/announcing-ogn-payments-buy-or-sell-using-origin-tokens-8b937daa66e8',
      linkKey: 'growth.share.content37.link',
      post: {
        tweet: {
          default: `Use $OGN to buy, sell, and promote listings on @originprotocol. https://medium.com/originprotocol/announcing-ogn-payments-buy-or-sell-using-origin-tokens-8b937daa66e8`,
          translations: [ ]
        }
      }
    },
    commission: {
      titleKey: 'growth.share.content38.title',
      detailsKey: 'growth.share.content38.details',
      image: 'images/growth/share-content38.png',
      link: 'https://medium.com/originprotocol/announcing-origin-commissions-to-promote-seller-listings-with-ogn-28a08a32e6b8',
      linkKey: 'growth.share.content38.link',
      post: {
        tweet: {
          default: `https://medium.com/originprotocol/announcing-origin-commissions-to-promote-seller-listings-with-ogn-28a08a32e6b8`,
          translations: [ ]
        }
      }
    },
    hunt: {
      titleKey: 'growth.share.content39.title',
      detailsKey: 'growth.share.content39.details',
      image: 'images/growth/share-content39.png',
      link: 'https://www.producthunt.com/posts/origin-marketplace',
      linkKey: 'growth.share.content39.link',
      post: {
        tweet: {
          default: `Check out @originprotocol on @ProductHunt! https://www.producthunt.com/posts/origin-marketplace`,
          translations: [ ]
        }
      }
    },
    evan: {
      titleKey: 'growth.share.content40.title',
      detailsKey: 'growth.share.content40.details',
      image: 'images/growth/share-content40.png',
      link: 'https://www.originprotocol.com/video/evan-tana-122-west-ventures',
      linkKey: 'growth.share.content40.link',
      post: {
        tweet: {
          default: `Watch this video to learn about the 3 reasons @evantana decided to invest in @originprotocol. https://www.originprotocol.com/video/evan-tana-122-west-ventures`,
          translations: [ ]
        }
      }
    }
  }
}

module.exports = feb2020Config
