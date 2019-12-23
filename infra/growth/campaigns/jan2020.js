const { tokenToNaturalUnits } = require('../src/util/token')


const jan2020Config = {
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
              amount: tokenToNaturalUnits(1),
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
          id: 'TwitterAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TwitterAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(1),
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
          id: 'KakaoAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'KakaoAttestationPublished',
            reward: {
              amount: tokenToNaturalUnits(1),
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
              amount: tokenToNaturalUnits(1),
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
          id: 'TwitterShare26',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'investors',
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
          id: 'TwitterShare27',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'fortune',
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
          id: 'TwitterShare28',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'stevechen',
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
          id: 'TwitterShare29',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'yupan',
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
          id: 'TwitterShare30',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'paulv',
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
          id: 'TwitterShare31',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'future',
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
          id: 'TwitterShare32',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'blockfolio',
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
          id: 'TwitterShare33',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'telegram',
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
          id: 'TwitterShare34',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'techcrunch',
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
          id: 'FacebookShare26',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'investors',
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
          id: 'FacebookShare27',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'fortune',
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
          id: 'FacebookShare28',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'stevechen',
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
          id: 'FacebookShare29',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'yupan',
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
          id: 'FacebookShare30',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'paulv',
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
        },       {
          id: 'FacebookShare31',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'future',
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
          id: 'FacebookShare32',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'blockfolio',
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
          id: 'FacebookShare33',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'telegram',
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
          id: 'FacebookShare34',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'techcrunch',
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
              amount: tokenToNaturalUnits(20),
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
              amount: tokenToNaturalUnits(20),
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
          id: 'PartnerReferral',
          class: 'PartnerReferralEvent',
          config: {
            eventType: 'PartnerReferral',
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
    investors: {
      titleKey: 'growth.share.content26.title',
      detailsKey: 'growth.share.content26.details',
      image: 'images/growth/share-content26.png',
      link: 'https://www.originprotocol.com/video/origin-investor-video',
      linkKey: 'growth.share.content26.link',
      post: {
        tweet: {
          default: `Here is why over 800 investors believe in @OriginProtocol. https://www.originprotocol.com/video/origin-investor-video`,
          translations: [ ]
        }
      }
    },
    fortune: {
      titleKey: 'growth.share.content27.title',
      detailsKey: 'growth.share.content27.details',
      image: 'images/growth/share-content27.png',
      link: 'https://www.originprotocol.com/video/fortune-magazine-with-origin-founders',
      linkKey: 'growth.share.content27.link',
      post: {
        tweet: {
          default: `In this interview with @FortuneMagazine, founders of @OriginProtocol discuss their vision for creating a truly decentralized sharing economy. https://www.originprotocol.com/video/fortune-magazine-with-origin-founders`,
          translations: [ ]
        }
      }
    },
    stevechen: {
      titleKey: 'growth.share.content28.title',
      detailsKey: 'growth.share.content28.details',
      image: 'images/growth/share-content28.jpg',
      link: 'https://www.originprotocol.com/video/steve-chen-youtube-founder',
      linkKey: 'growth.share.content28.link',
      post: {
        tweet: {
          default: `Steve Chen, co-founder of @YouTube and investor of @OriginProtocol, talks about what it was like working with some of Origin's employees in the early days of YouTube: https://www.originprotocol.com/video/steve-chen-youtube-founder`,
          translations: [ ]
        }
      }
    },
    yupan: {
      titleKey: 'growth.share.content29.title',
      detailsKey: 'growth.share.content29.details',
      image: 'images/growth/share-content29.png',
      link: 'https://www.originprotocol.com/video/yu-pan-paypal-cofounder-and-first-youtube-engineer',
      linkKey: 'growth.share.content29.link',
      post: {
        tweet: {
          default: `Meet Yu Pan: PayPal's Co-founder, first YouTube engineer and now lead R&D engineer at @OriginProtocol: https://www.originprotocol.com/video/yu-pan-paypal-cofounder-and-first-youtube-engineer`,
          translations: [ ]
        }
      }
    },
    paulv: {
      titleKey: 'growth.share.content30.title',
      detailsKey: 'growth.share.content30.details',
      image: 'images/growth/share-content30.png',
      link: 'https://www.originprotocol.com/video/paul-veradittakit-pantera-capital-origin',
      linkKey: 'growth.share.content30.link',
      post: {
        tweet: {
          default: `Watch @veradittakit, Co-Investment Officer at @PanteraCapital talking about how @originprotocol enables financial and social freedom. https://www.originprotocol.com/video/paul-veradittakit-pantera-capital-origin`,
          translations: [ ]
        }
      }
    },
    future: {
      titleKey: 'growth.share.content31.title',
      detailsKey: 'growth.share.content31.details',
      image: 'images/growth/share-content31.png',
      link: 'https://www.originprotocol.com/video/the-future-of-the-sharing-economy',
      linkKey: 'growth.share.content31.link',
      post: {
        tweet: {
          default: `With @OriginProtocol, we can build a future where sharing economy marketplaces are built without intermediaries and buyers and sellers connect directly on the blockchain. https://www.originprotocol.com/video/the-future-of-the-sharing-economy`,
          translations: [ ]
        }
      }
    },
    blockfolio: {
      titleKey: 'growth.share.content32.title',
      detailsKey: 'growth.share.content32.details',
      image: 'images/growth/share-content32.png',
      link: 'http://blockfolio.com/coin/OGN',
      linkKey: 'growth.share.content32.link',
      post: {
        tweet: {
          default: `Follow @OriginProtocol on @Blockfolio Signal and never miss another update again: http://blockfolio.com/coin/OGN`,
          translations: [ ]
        }
      }
    },
    telegram: {
      titleKey: 'growth.share.content33.title',
      detailsKey: 'growth.share.content33.details',
      image: 'images/growth/share-content33.png',
      link: 'https://t.me/originprotocol',
      linkKey: 'growth.share.content33.link',
      post: {
        tweet: {
          default: `Follow @OriginProtocol on #Telegram and earn Origin Token (OGN) today! https://t.me/originprotocol`,
          translations: [ ]
        }
      }
    },
    techcrunch: {
      titleKey: 'growth.share.content34.title',
      detailsKey: 'growth.share.content34.details',
      image: 'images/growth/share-content34.png',
      link: 'https://techcrunch.com/2018/10/10/origin-protocol/',
      linkKey: 'growth.share.content34.link',
      post: {
        tweet: {
          default: `Great @TechCrunch article on how @OriginProtocol is building one of the most promising blockchain platforms for the new sharing economy. https://techcrunch.com/2018/10/10/origin-protocol/`,
          translations: [ ]
        }
      }
    }
  }
}

module.exports = jan2020Config
