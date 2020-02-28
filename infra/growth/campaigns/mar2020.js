const { tokenToNaturalUnits } = require('../src/util/token')

const mar2020Config = {
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
          id: 'TwitterShare41',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'samsung',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare42',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'gopax',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare43',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'gumi',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare44',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'seoul',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'TwitterShare45',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'extension',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare41',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'samsung',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare42',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'gopax',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare43',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'gumi',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare44',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'seoul',
            reward: null,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'
          }
        },
        {
          id: 'FacebookShare45',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'extension',
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
        },
        {
          id: 'ThreeAttestations',
          class: 'MultiEvents',
          config: {
            eventTypes: [
              'PhoneAttestationPublished',
              'FacebookAttestationPublished',
              'TwitterAttestationPublished',
              'KakaoAttestationPublished',
              'TelegramAttestationPublished'
            ],
            visible: false,
            numEventsRequired: 3,
            reward: null,
            nextLevelCondition: true,
            scope: 'user',
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.three.attestations.requirement',
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
          id: 'BrowserExtensionInstall',
          class: 'SingleEvent',
          config: {
            eventType: 'BrowserExtensionInstalled',
            reward: {
              amount: tokenToNaturalUnits(15),
              currency: 'OGN'
            },
            limit: 1,
            visible: true,
            nextLevelCondition: false,
            scope: 'campaign',
            statusScope: 'user'

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
    samsung: {
      titleKey: 'growth.share.content41.title',
      detailsKey: 'growth.share.content41.details',
      image: 'images/growth/share-content41.png',
      link: 'https://medium.com/originprotocol/samsung-keystore-sdk-react-native-wrapper-65b73294cf33',
      linkKey: 'growth.share.content41.link',
      post: {
        tweet: {
          default: `Together with @Samsung, @originprotocol is putting real-world use cases for decentralized applications in the hands of people everywhere, through mobile. https://medium.com/originprotocol/samsung-keystore-sdk-react-native-wrapper-65b73294cf33`,
          translations: [ ]
        }
      }
    },
    gopax: {
      titleKey: 'growth.share.content42.title',
      detailsKey: 'growth.share.content42.details',
      image: 'images/growth/share-content42.png',
      link: 'https://medium.com/originprotocol/origin-tokens-ogn-list-on-exchanges-coinone-and-gopax-e2874c7b73e8',
      linkKey: 'growth.share.content42.link',
      post: {
        tweet: {
          default: `In addition to @binance, $OGN from @originprotocol is now listed on @CoinoneOfficial and @GOPAX_kr https://medium.com/originprotocol/origin-tokens-ogn-list-on-exchanges-coinone-and-gopax-e2874c7b73e8`,
          translations: [ ]
        }
      }
    },
    gumi: {
      titleKey: 'growth.share.content43.title',
      detailsKey: 'growth.share.content43.details',
      image: 'images/growth/share-content43.png',
      link: 'https://www.originprotocol.com/video/gumi-ray-zhang-origin-team',
      linkKey: 'growth.share.content43.link',
      post: {
        tweet: {
          default: `Ray Zhang, Managing Director at Gumi, shares his vision on how @originprotocol can tackle its large-scale mission with its world-class team. https://www.originprotocol.com/video/gumi-ray-zhang-origin-team`,
          translations: [ ]
        }
      }
    },
    seoul: {
      titleKey: 'growth.share.content44.title',
      detailsKey: 'growth.share.content44.details',
      image: 'images/growth/share-content44.png',
      link: 'https://www.originprotocol.com/video/erica-kang-south-korea-seoul',
      linkKey: 'growth.share.content44.link',
      post: {
        tweet: {
          default: `Erica Kang @ekang426, founder of @kryptoseoul, shares her experience using the @originprotocol Marketplace app and encourages new entrants to the ecosystem to try it out. https://www.originprotocol.com/video/erica-kang-south-korea-seoul`,
          translations: [ ]
        }
      }
    },
    extension: {
      titleKey: 'growth.share.content45.title',
      detailsKey: 'growth.share.content45.details',
      image: 'images/growth/share-content45.png',
      link: 'https://medium.com/originprotocol/install-the-new-origin-browser-extension-to-earn-ogn-d3f0cd30ea8d',
      linkKey: 'growth.share.content45.link',
      post: {
        tweet: {
          default: `Check out the @originprotocol browser extension and earn 15 $OGN! https://medium.com/originprotocol/install-the-new-origin-browser-extension-to-earn-ogn-d3f0cd30ea8d`,
          translations: [ ]
        }
      }
    }
  }
}

module.exports = mar2020Config
