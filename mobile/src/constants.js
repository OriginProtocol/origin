'use strict'

class Enum extends Array {
  constructor(...args) {
    super(...args)
    for (const k of args) {
      this[k] = k
    }
  }
}

export const DEFAULT_NOTIFICATION_PERMISSIONS = {
  alert: true,
  badge: true,
  sound: true
}

// Default user agents to be used by the WebView
export const DEFAULT_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B72 Safari/602.1'

export const DEFAULT_ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'

export const WALLET_INFO = 'WALLET_INFO'
export const WALLET_PASSWORD = 'WALLET_PASSWORD'
export const WALLET_STORE = 'WALLET_STORE'

export const ETH_NOTIFICATION_TYPES = new Enum('APN', 'FCM')

export const BALANCE_POLL_INTERVAL = 5000

export const NETWORKS = [
  {
    id: 1,
    name: 'Mainnet',
    dappUrl: 'https://shoporigin.com/#/',
    provider:
      'https://eth-mainnet.alchemyapi.io/jsonrpc/FCA-3myPH5VFN8naOWyxDU6VkxelafK6'
  },
  {
    id: 4,
    name: 'Rinkeby',
    dappUrl: 'https://dapp.staging.originprotocol.com/#/',
    provider:
      'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI'
  },
  {
    id: 2222,
    name: 'Origin',
    dappUrl: 'https://dapp.dev.originprotocol.com/#/',
    provider: 'https://testnet.originprotocol.com/rpc'
  }
]

// Push additional networks if in development
// eslint-disable-next-line no-undef
if (__DEV__) {
  NETWORKS.push({
    id: 999,
    name: 'Localhost',
    dappUrl: `http://${process.env.HOST || 'localhost'}:3000`
  })
  NETWORKS.push({
    id: 999,
    name: 'Docker',
    dappUrl: `http://${process.env.HOST || 'localhost'}:3000/docker#/`
  })
}

export const PROMPT_MESSAGE = 'I am ready to start messaging on Origin.'
export const PROMPT_PUB_KEY = 'My public messaging key is: '

export const CURRENCIES = [
  ['fiat-USD', 'USD', '$'],
  ['fiat-GBP', 'GBP', '£'],
  ['fiat-EUR', 'EUR', '€'],
  ['fiat-KRW', 'KRW', '₩'],
  ['fiat-JPY', 'JPY', '¥'],
  ['fiat-CNY', 'CNY', '¥'],
  ['fiat-SGD', 'SGD', 'S$']
]

/* eslint-disable camelcase */
// import * as de_DE from 'locales/de_DE.json'
// import * as el_GR from 'locales/el_GR.json'
import * as en_US from 'locales/en_US.json'
import * as es_ES from 'locales/es_ES.json'
import * as fr_FR from 'locales/fr_FR.json'
import * as it_IT from 'locales/it_IT.json'
import * as ja_JP from 'locales/ja_JP.json'
import * as ko_KR from 'locales/ko_KR.json'
// import * as nl_NL from 'locales/nl_NL.json'
// import * as pt_PT from 'locales/pt_PT.json'
// import * as ro_RO from 'locales/ro_RO.json'
import * as ru_RU from 'locales/ru_RU.json'
// import * as tr_TR from 'locales/tr_TR.json'
// import * as uk_UA from 'locales/uk_UA.json'
// import * as vi_VN from 'locales/vi_VN.json'
import * as zh_CN from 'locales/zh_CN.json'
// import * as zh_TW from 'locales/zh_TW.json'

export const TRANSLATIONS = {
  // Comment out those without translations
  // de_DE,
  // el_GR,
  en_US,
  es_ES,
  fr_FR,
  it_IT,
  ja_JP,
  ko_KR,
  // nl_NL,
  // pt_PT,
  // ro_RO,
  ru_RU,
  // tr_TR,
  // uk_UA,
  // vi_VN,
  zh_CN
  // zh_TW
}
/* eslint-enable camelcase */

export const LANGUAGES = [
  ['de_DE', 'Deutsch'],
  ['el_GR', 'ελληνικά'],
  ['es_ES', 'Español'],
  ['fil_PH', 'Filipino'],
  ['fr_FR', 'Français'],
  ['hr_HR', 'Hrvatski Jezik'],
  ['id_ID', 'Indonesian'],
  ['it_IT', 'Italiano'],
  ['ja_JP', '日本語'],
  ['ko_KR', '한국어'],
  ['nl_NL', 'Nederlands'],
  ['pt_PT', 'Português'],
  ['ro_RO', 'Limba Eomână'],
  ['ru_RU', 'Русский'],
  ['th_TH', 'ไทย'],
  ['tr_TR', 'Türkçe'],
  ['uk_UA', 'Українська'],
  ['vi_VN', 'Tiếng Việt'],
  ['zh_CN', '简体中文'],
  ['zh_TW', '繁體中文'],
  ['en_US', 'English']
].filter(l => Object.keys(TRANSLATIONS).includes(l[0]))
