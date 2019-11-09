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
          id: 'ListingPurchase1-001-51',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-51',
            reward: {
              amount: tokenToNaturalUnits(20),
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
              amount: tokenToNaturalUnits(3),
              currency: 'OGN'
            },
            visible: true,
            limit: 100,
            nextLevelCondition: false,
            scope: 'campaign',
            iconSrc: 'images/growth/listing-1-001-53-icon.jpg',
            title: '送礼还送Dai | 王者荣耀皮肤288点券-下单即返7元Dai！',
            details: ' '
          }
        },
        {
          id: 'ListingPurchase1-001-54',
          class: 'ListingIdPurchase',
          config: {
            eventType: 'ListingPurchased',
            listingId: '1-001-54',
            reward: {
              amount: tokenToNaturalUnits(2),
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
              amount: tokenToNaturalUnits(2),
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
              amount: tokenToNaturalUnits(3),
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
              amount: tokenToNaturalUnits(3),
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
            details: 'TEGIC 大岩蛇数据线 苹果数据线 安卓苹果数据线通用 快充数据线 数据线 三合一 钛灰色  '
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
              amount: tokenToNaturalUnits(15),
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
              amount: tokenToNaturalUnits(10),
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
    anna_wang_decentralise: {
      titleKey: 'growth.share.content16.title',
      detailsKey: 'growth.share.content16.details',
      image: 'images/growth/share-content16.png',
      link: 'https://www.originprotocol.com/video/anna-wang-decentralized-sharing-economy',
      linkKey: 'growth.share.content16.link',
      post: {
        tweet: {
          default: `In this video, @AbsolumentAnna shares her thoughts on @OriginProtocol's mission and what a #decentralized sharing economy means to her. https://www.originprotocol.com/video/anna-wang-decentralized-sharing-economy`,
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
          default: `Ryan Kim is a partner at @Hashed_official, the largest blockchain accelerator in Korea. In this video, Ryan shares why Hashed decided to invest in @OriginProtocol and continues to support the project today. https://www.originprotocol.com/video/ryan-kim-hashed`,
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
          default: `Watch @obnty, Founder of NodeTokyo sharing how @OriginProtocol maximizes freedom and allows people to buy and sell without any restrictions. https://www.originprotocol.com/video/yusuke-obinata-nodetokyo`,
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
          default: `Decentralized commerce can empower local communities to buy and sell freely in the emerging world. Here is a recap of @OriginProtocol's recent meetup in Venezuela. https://medium.com/originprotocol/these-venezuelan-merchants-are-reshaping-commerce-with-origin-c28e6d2169d9`,
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
          default: `In this video, @Andy_Bromberg, Founder and President of @CoinList discusses some of the incredible new possibilities enabled by @OriginProtocol and peer-to-peer marketplaces. https://www.originprotocol.com/video/coinlist-founder-decentralized-marketplace-future`,
          translations: [ ]
        }
      }
    },
  }
}

module.exports = novemberConfig
