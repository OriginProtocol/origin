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
          id: 'AirbnbAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'AirbnbAttestationPublished',
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
          id: 'GoogleAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'GoogleAttestationPublished',
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
          id: 'GitHubAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'GitHubAttestationPublished',
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
          id: 'LinkedInAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'LinkedInAttestationPublished',
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
          id: 'WebsiteAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'WebsiteAttestationPublished',
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
          id: 'TwitterShare21',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'shopify',
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
          id: 'TwitterShare22',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'podcast',
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
          id: 'TwitterShare23',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'commission',
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
          id: 'TwitterShare24',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'pantera',
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
          id: 'TwitterShare25',
          class: 'SocialShare',
          config: {
            socialNetwork: 'twitter',
            eventType: 'SharedOnTwitter',
            additionalLockConditions: ['TwitterAttestation'],
            contentId: 'joey',
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
          id: 'FacebookShare21',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'shopify',
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
          id: 'FacebookShare22',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'podcast',
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
          id: 'FacebookShare23',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'commission',
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
          id: 'FacebookShare24',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'pantera',
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
          id: 'FacebookShare25',
          class: 'SimpleSocialShare',
          config: {
            socialNetwork: 'facebook',
            eventType: 'SharedOnFacebook',
            contentId: 'joey',
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
          id: 'ListingPurchase1-001-51',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-51',
            reward: {
              amount: tokenToNaturalUnits(40),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-51-icon.jpg',
            title: '送礼还送Dai | 开吃卡-购卡即返30元Dai! 198元得12个吃货大福袋，还送168元惊喜礼包',
            details: '我们派出农业买手团队，让他们前往全国各地，走遍山河田野，精选最佳产物；我们成立吃货俱乐部，以吃货福袋的形式推出【开吃卡】，邀请吃货品鉴。'
          }
        },
        {
          id: 'ListingPurchase1-001-52',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-52',
            reward: {
              amount: tokenToNaturalUnits(80),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-52-icon.jpg',
            title: '送礼还送Dai | 如程会员卡-购卡即返100元Dai! 688元享特色度假酒店全年免费住',
            details: '如程是一家会员制特色度假酒店预订平台，成为如程会员，仅需688即享如程平台上全国热门城市、景区的特色度假酒店提前预订免费住。一年内所有如程合作的特色度假酒店，你都可以不限酒店，不限房型，不限节假日免费入住。'
          }
        },
        {
          id: 'ListingPurchase1-001-53',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-53',
            reward: {
              amount: tokenToNaturalUnits(5),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-53-icon.jpg',
            title: '送礼还送Dai | 王者荣耀皮肤288点券-下单即返7元Dai！',
            details: '王者荣耀App内价值288点券的英雄皮肤可任选一。'
          }
        },
        {
          id: 'ListingPurchase1-001-54',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-54',
            reward: {
              amount: tokenToNaturalUnits(5),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-54-icon.jpg',
            title: '送礼还送Dai | Hellobike骑行单车周卡-下单即返2.5元Dai！',
            details: 'Hellobike骑行周卡 全国通用兑换券'
          }
        },
        {
          id: 'ListingPurchase1-001-47',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-47',
            reward: {
              amount: tokenToNaturalUnits(5),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-47-icon.jpg',
            title: '送礼还送Dai | Mobike骑行单车7次卡-下单即返2.5元Dai！',
            details: '摩拜单车7天7次骑行卡。'
          }
        },
        {
          id: 'ListingPurchase1-001-55',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-55',
            reward: {
              amount: tokenToNaturalUnits(5),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-55-icon.jpg',
            title: '送礼还送Dai | 杭州西湖秀酒店1079元福利券-下单即返6.9元Dai！',
            details: '该券用于入住杭州西湖区秀酒店复式厅堂影院房抵扣。'
          }
        },
        {
          id: 'ListingPurchase1-001-56',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-56',
            reward: {
              amount: tokenToNaturalUnits(5),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-56-icon.jpg',
            title: '送礼还送Dai | 北京三段锦大片摄影1000元福利券-下单即返6.9元Dai！',
            details: '该券用于明星御用拍摄团队打造个人形象片拍摄抵扣。'
          }
        },
        {
          id: 'ListingPurchase1-001-57',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-57',
            reward: {
              amount: tokenToNaturalUnits(35),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-57-icon.jpg',
            title: '送礼还送Dai | BEPAL Q硬件钱包-下单即返30元Dai！',
            details: '采用分层确定性的方案进行 (HD Wallet) 货币管理，即单助记词种子密码（联合支付密码）可管理所有区块链资产。'
          }
        },
        {
          id: 'ListingPurchase1-001-49',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-49',
            reward: {
              amount: tokenToNaturalUnits(10),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-49-icon.jpg',
            title: '送礼还送Dai | 大岩蛇数据线-下单即返11元Dai！',
            details: 'TEGIC 大岩蛇数据线 苹果数据线 安卓苹果数据线通用 快充数据线 数据线 三合一 钛灰色'
          }
        },
        {
          id: 'ListingPurchase1-001-58',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-58',
            reward: {
              amount: tokenToNaturalUnits(30),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-58-icon.jpg',
            title: '送礼还送Dai | 冰格透视移动电源充电宝-下单即返40元Dai！',
            details: 'TEGIC 冰格充电宝 PD18W快速充电 透视移动电源 充电宝 自带线 灰色(20号发货) 自带Lightning'
          }
        },
        {
          id: 'ListingPurchase1-001-59',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-59',
            reward: {
              amount: tokenToNaturalUnits(20),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-59-icon.jpg',
            title: '送礼还送Dai | 电磁块无线TS1充电宝-下单即返29元Dai！',
            details: 'TEGIC 无线充电器 无线充电宝 无线10W QI协议充电宝 移动电源苹果安卓通用 TS1 电磁块'
          }
        },
        {
          id: 'ListingPurchase1-001-48',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-48',
            reward: {
              amount: tokenToNaturalUnits(15),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-48-icon.jpg',
            title: '送礼还送Dai | 小拳石双接口充电头-下单即返14元Dai！',
            details: 'TEGIC PD充电器 双口充电头 45W快充笔记本手机快充QC3.0 PD45W小拳石'
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
    shopify: {
      titleKey: 'growth.share.content21.title',
      detailsKey: 'growth.share.content21.details',
      image: 'images/growth/share-content21.jpg',
      link: 'https://medium.com/originprotocol/built-on-origin-a-decentralized-shopify-alternative-888adc4198b0',
      linkKey: 'growth.share.content21.link',
      post: {
        tweet: {
          default: `Check out @originprotocol's e-commerce store that is a decentralized, open source alternative to Shopify!  https://medium.com/originprotocol/built-on-origin-a-decentralized-shopify-alternative-888adc4198b0`,
          translations: [ ]
        }
      }
    },
    podcast: {
      titleKey: 'growth.share.content22.title',
      detailsKey: 'growth.share.content22.details',
      image: 'images/growth/share-content22.jpg',
      link: 'https://podcast.encrypt-d.com/how-an-early-youtube-employee-is-competing-against-uber-and-airbnb',
      linkKey: 'growth.share.content22.link',
      post: {
        tweet: {
          default: `Listen to this episode from @Encrypt_d Podcast where @matthewliu, Co-founder of @originprotocol discusses his career as a Product Manager during YouTube's early days, and how Origin is building decentralized marketplaces of the future. https://twitter.com/originprotocol/status/1196697372341850113`,
          translations: [ ]
        }
      }
    },
    commission: {
      titleKey: 'growth.share.content23.title',
      detailsKey: 'growth.share.content23.details',
      image: 'images/growth/share-content23.png',
      link: 'https://medium.com/originprotocol/announcing-origin-commissions-to-promote-seller-listings-with-ogn-28a08a32e6b8',
      linkKey: 'growth.share.content23.link',
      post: {
        tweet: {
          default: `If you are a DApp developer, marketplace operator or an affiliate on @originprotocol, you can earn Origin Tokens through Origin Commissions. https://medium.com/originprotocol/announcing-origin-commissions-to-promote-seller-listings-with-ogn-28a08a32e6b8`,
          translations: [ ]
        }
      }
    },
    pantera: {
      titleKey: 'growth.share.content24.title',
      detailsKey: 'growth.share.content24.details',
      image: 'images/growth/share-content24.png',
      link: 'https://www.originprotocol.com/video/paul-veradittakit-pantera-capital-origin',
      linkKey: 'growth.share.content24.link',
      post: {
        tweet: {
          default: `Watch @veradittakit, Co-Investment Officer at @PanteraCapital talking about how @originprotocol enables financial and social freedom. https://www.originprotocol.com/video/paul-veradittakit-pantera-capital-origin`,
          translations: [ ]
        }
      }
    },
    joey: {
      titleKey: 'growth.share.content25.title',
      detailsKey: 'growth.share.content25.details',
      image: 'images/growth/share-content25.png',
      link: 'https://www.originprotocol.com/video/joey-krug-augur-value-origin',
      linkKey: 'growth.share.content25.link',
      post: {
        tweet: {
          default: `In this video, @JoeyKrug, Co-founder of 
@AugurProject and Co-investment Officer of @PanteraCapital, explains how a peer-to-peer cryptocurrency network like Origin can reduce fees and create a better experience for users. https://www.originprotocol.com/video/joey-krug-augur-value-origin`,
          translations: [ ]
        }
      }
    },
  }
}

module.exports = novemberConfig
