import createDebug from 'debug'

const debug = createDebug('linker-client')

const WALLET_LINKER_DATA = 'walletLinkerData'

export default class Session {
  constructor() {
    this.clear()
  }

  clear() {
    this.accounts = []
    this.linked = false
    this.lastMessageId = undefined
    this.token = ''
    this.privData = null
  }

  save() {
    const data = {
      accounts: this.accounts,
      linked: this.linked,
      lastMessageId: this.lastMessageId,
      token: this.token,
      privData: this.privData
    }
    debug('saving session storage:', data)
    sessionStorage.setItem(WALLET_LINKER_DATA, JSON.stringify(data))
  }

  load() {
    const dataStr = sessionStorage.getItem(WALLET_LINKER_DATA)
    let data
    try {
      data = JSON.parse(dataStr)
    } catch (err) {
      console.error('error parsing session wallet data:', err)
      throw err
    }
    if (!data) return

    this.accounts = data.accounts
    this.token = data.token
    this.lastMessageId = data.lastMessageId
    this.linked = data.linked
    this.privData = data.privData
    debug('loaded session', this)
  }
}
