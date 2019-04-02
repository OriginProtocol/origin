'use strict'

import keyMirror from './utils/keyMirror'

export const ACCOUNT_MAPPING = 'ACCOUNT_MAPPING'

export const DEFAULT_NOTIFICATION_PERMISSIONS = {
  alert: true,
  badge: true,
  sound: true
}

export const EVENTS = keyMirror(
  {
    PROMPT_TRANSACTION: null,
    PROMPT_SIGN: null,
    CURRENT_ACCOUNT: null,
    AVAILABLE_ACCOUNTS: null,
    LOADED: null,
    LINKED: null,
    TRANSACTED: null,
    REJECT: null,
    UPDATE: null,
    SHOW_MESSAGES: null,
    NOTIFICATION: null,
    NEW_MESSAGE: null
  },
  'WalletEvents'
)

export const WALLET_INFO = 'WALLET_INFO'
export const WALLET_PASSWORD = 'WALLET_PASSWORD'
export const WALLET_STORE = 'WALLET_STORE'
