import secp256k1 from 'secp256k1'
import ZeroClientProvider from 'web3-provider-engine/zero'
import uuidv1 from 'uuid/v1'
import cryptoRandomString from 'crypto-random-string'

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}
const PLACEHOLDER_ADDRESS = '0x3f17f1962B36e491b30A40b2405849e597Ba5FB5'
const LOCAL_KEY_STORE = 'wallet-linker:lks'

export default class WalletLinker {
  //define class variable for PLACEHOLDER ADDRESS
  static get PLACEHOLDER_ADDRESS() {
    return PLACEHOLDER_ADDRESS
  }

  constructor({ linkerServerUrl, fetch, networkChangeCb, web3, ecies }) {
    this.serverUrl = linkerServerUrl
    this.fetch = fetch
    this.accounts = []
    this.networkChangeCb = networkChangeCb
    this.callbacks = {}
    this.session_token = ''
    this.web3 = web3
    this.ecies = ecies
    this.loadSessionStorage()
    this.showPopUp = null // define callback here to display popUp
    this.setLinkCode = null // define callback here to setLinkCode
  }

  logout() {
    sessionStorage.setItem(
      'walletLinkerData',
      JSON.stringify({
        accounts: [],
        session_token: ''
      })
    )
    this.loadSessionStorage()
    this.closeLinkMessages()
    localStorage.removeItem(LOCAL_KEY_STORE)
    //clearInterval(self.interval)
  }

  async preLinked(linkTokens) {
    const [link_id, code, priv_key] = linkTokens.split('-')

    if (link_id && code && priv_key)
    {
      const { session_token, linked } = await this.post('link-prelinked', {
        code,
        link_id,
        return_url: this.getReturnUrl()
      })

      this.linked = linked

      if (linked && priv_key)
      {
        localStorage.setItem(LOCAL_KEY_STORE, priv_key)
      }
      if (this.session_token != session_token)
      {
        this.session_token = session_token
        this.startMessagesSync()
      }
      this.syncSessionStorage()
    }
  }

  async startLink() {
    const code = await this.generateLinkCode()
    this.setLinkCode(code)
    this.showPopUp(true)
  }

  cancelLink() {
    this.pending_call = undefined
    this.showPopUp(false)
  }

  loadSessionStorage() {
    const wallet_data_str = sessionStorage.getItem('walletLinkerData')
    let wallet_data = undefined
    try {
      wallet_data = JSON.parse(wallet_data_str)
    } catch (err) {
      console.error(err)
    }

    if (wallet_data) {
      this.accounts = wallet_data.accounts
      ;(this.networkRpcUrl = wallet_data.networkRpcUrl),
      (this.session_token = wallet_data.session_token),
      (this.last_message_id = wallet_data.last_message_id)
      this.linked = wallet_data.linked
    }
  }

  syncSessionStorage() {
    const wallet_data = {
      accounts: this.accounts,
      networkRpcUrl: this.networkRpcUrl,
      linked: this.linked,
      last_message_id: this.last_message_id,
      session_token: this.session_token
    }
    sessionStorage.setItem('walletLinkerData', JSON.stringify(wallet_data))
  }

  getProvider() {
    const provider = ZeroClientProvider({
      rpcUrl:
        this.networkRpcUrl && this.linked
          ? this.networkRpcUrl
          : this.web3.currentProvider.host,
      getAccounts: this.getAccounts.bind(this),
      //signTransaction: this.signTransaction.bind(this),
      //signPersonalMessage: this.signPersonalMessage.bind(this),
      processTransaction: this.processTransaction.bind(this)
    })
    const hookedWallet = provider._providers[6]

    if (!hookedWallet.validateTransaction) {
      console.log('The sub provider at [6] is NOT a hooked wallet.')
    } else {
      //we basically make validate a passthrough for now
      hookedWallet.validateTransaction = (txParams, cb) => {
        cb()
      }
    }
    //take out the caching which is being stupid..
    provider._providers.splice(3, 1)
    provider._providers.splice(4, 1)
    return provider
  }

  testSignMessage() {
    console.log("signMessage fired..", arguments)
  }

  getAccounts(callback) {
    if (callback) {
      callback(undefined, this.accounts)
    } else {
      return new Promise(resolve => {
        resolve(this.accounts)
      })
    }
  }

  // NOTE this is emulate metamask's sendAsync for eth_signTypedData_v3
  sendAsync({method, params, from}, callback) {
    console.log('sendAsync:', method, params, from)

    if (method == "eth_signTypedData_v3")
    {
      const call_id = uuidv1()
      //translate gas to gasLimit
      this.callbacks[call_id] = async data => {
        callback(undefined, data)
      }
      const call = this.createCall('signMessage', {method, data:params[1], signer:params[0] })
      if (!this.linked) {
        throw new Error("Cannot sign from an unlinked wallet")
      } else {
        const result = this.post('call-wallet/'+ this.session_token, {
          call_id,
          accounts: this.accounts,
          call,
          return_url: this.getReturnUrl()
        })
        result.then(() => {}).catch(error_data => {
          delete this.callbacks[call_id]
          callback(error_data, undefined)
        })
      }
    }
  }

  signTransaction(txn_object, callback) {
    const call_id = uuidv1()
    //txn_object['chainId'] = this.web3.utils.toHex(this.netId)
    txn_object['gasLimit'] = txn_object['gas']
    const result = this.post('call-wallet', {
      session_token: this.session_token,
      call_id: call_id,
      accounts: this.accounts,
      call: this.createCall('signTransaction', { txn_object }),
      return_url: this.getReturnUrl()
    })

    this.callbacks[call_id] = data => {
      callback(undefined, data)
    }

    result.then(() => {}).catch(error_data => {
      delete this.callbacks[call_id]
      callback(error_data, undefined)
    })
  }

  registerCallback(call_id, handler) {
    this.callbacks[call_id] = handler
  }

  createCall(method, params) {
    return { method, net_id: this.netId, params }
  }

  customSignMessage(params, call_id) {
    const call = this.createCall('signMessage', params)
    if (!this.linked) {
      this.pending_call = {
        call_id,
        call
      }
      this.startLink()
    } else {
      this.post('call-wallet/' + this.session_token, {
        call_id: call_id,
        accounts: this.accounts,
        call,
        return_url: this.getReturnUrl()
      })
    }
  }

  processTransaction(txn_object, callback) {
    console.log('processTransaction:', txn_object, callback)
    const call_id = uuidv1()
    //translate gas to gasLimit
    txn_object['gasLimit'] = txn_object['gas']
    if (
      txn_object['from'].toLowerCase() ==
      PLACEHOLDER_ADDRESS.toLowerCase()
    ) {
      txn_object['from'] = undefined
    }

    this.callbacks[call_id] = async data => {
      callback(undefined, data.hash)
    }

    const call = this.createCall('processTransaction', { txn_object })
    if (!this.linked) {
      this.pending_call = {
        call_id,
        call,
      }
      this.startLink()
    } else {
      const result = this.post('call-wallet/'+ this.session_token, {
        call_id,
        accounts: this.accounts,
        call,
        return_url: this.getReturnUrl()
      })

      result.then(() => {}).catch(error_data => {
        delete this.callbacks[call_id]
        callback(error_data, undefined)
      })
    }
  }

  async changeNetwork(networkRpcUrl, force = false) {
    if (this.networkRpcUrl != networkRpcUrl || force) {
      this.networkRpcUrl = networkRpcUrl
      this.networkChangeCb()
      this.netId = await this.web3.eth.net.getId()
    }
  }

  processMessage(m) {
    const type = m.msg.type
    const message = m.msg.data
    const msgId = m.msgId
    switch (type) {
      case 'CONTEXT':
        if (message.session_token)
        {
          this.session_token = message.session_token
        }

        if (!message.linked && this.linked) {
          this.logout()
        } else {
          this.linked = message.linked
          if (this.linked) {
            this.cancelLink()
          }
        }
        const device = message.device
        if(device)
        {
          if (device.accounts)
          {
            this.accounts = device.accounts
          }
          if (device.network_rpc)
          {
            this.changeNetwork(device.network_rpc)
          }

          if(device.priv_data)
          {
            const data = JSON.parse(this.ecDecrypt(device.priv_data))

            if (data)
            {
              if (data.messaging && this.callbacks['messaging'])
              {
                this.callbacks['messaging'](data.messaging)
              }
            }
          }
        }
        else
        {
          this.accounts = []
        }

        break
      case 'CALL_RESPONSE':
        if (this.callbacks[message.call_id]) {
          this.callbacks[message.call_id](message.result)
          delete this.callbacks[message.call_id]
        } else {
          if (message.result && message.result.call) {
            //another hacky callback
            this.showNextPage()
          }
        }
        break
      case 'LOGOUT':
        if (this.linked) {
          this.logout()
        }
        break
    }
    if (msgId != undefined) {
      this.last_message_id = msgId
      this.syncSessionStorage()
    }
  }

  startMessagesSync() {
   /*
    if (!this.interval) {
      //5 second intervals for now
      this.interval = setInterval(this.syncLinkMessages.bind(this), 5 * 1000)
    }
    */
    
    this.syncLinkMessages()
    
  }

  getReturnUrl() {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      return window.location.href
    } else {
      return ''
    }
  }

  initSession() {
    if (this.linked && this.networkRpcUrl) {
      this.changeNetwork(this.networkRpcUrl, true)
    } else {
      //set the network to us..
      this.networkChangeCb()
    }
    this.syncLinkMessages()
  }

  getLinkPrivKey() {
    const localKey = localStorage.getItem(LOCAL_KEY_STORE)
    const privKey = localKey || cryptoRandomString(64).toString('hex')
    if (privKey != localKey)
    {
      localStorage.setItem(LOCAL_KEY_STORE, privKey)
    }
    return privKey
  }

  getLinkPubKey() {
    return secp256k1
      .publicKeyCreate(new Buffer(this.getLinkPrivKey(), 'hex'), false)
      .slice(1)
      .toString('hex')
  }

  ecDecrypt(buffer) {
    const priv_key = this.getLinkPrivKey()
    return this.ecies
      .decrypt(
        new Buffer(priv_key, 'hex'),
        new Buffer(buffer, 'hex')
      )
      .toString('utf8')
  }


  async generateLinkCode() {
    const ret = await this.post('generate-code', {
      session_token: this.session_token,
      return_url: this.getReturnUrl(),
      pending_call: this.pending_call,
      pub_key: this.getLinkPubKey(),
      notify_wallet: this.notify_wallet
    })
    if (ret) {
      this.link_code = ret.link_code
      this.linked = ret.linked
      if (this.session_token != ret.session_token)
      {
        this.session_token = ret.session_token
        this.startMessagesSync()
      }
      this.syncSessionStorage()
      return ret.link_code
    }
  }

  getLinkCode() {
    return this.link_code
  }

  closeLinkMessages() {
    if (this.msg_ws && this.msg_ws.readyState !== this.msg_ws.CLOSED)
    {
      this.msg_ws.close()
    }
  }

  async syncLinkMessages() {
    this.closeLinkMessages()
    const wsUrl = appendSlash(this.serverUrl.replace(/^http/, 'ws'))
    const ws = new WebSocket(wsUrl + 'linked-messages/' + (this.session_token || '-') + '/' +  (this.last_message_id || 0))

    ws.onmessage = e => {
      this.processMessage(JSON.parse(e.data))
    }

    ws.onclose = e => {
      console.log('Websocket closed event:', e)
      if (e.code != 1000)
      {
        //this is an abnormal closure let's try reopen this in a bit
        setTimeout(() => {
          if (this.msg_ws === ws) {
            this.syncLinkMessages()
          }
        }, 30000) // check in 60 seconds
      }
    }
    this.msg_ws = ws
  }

  async unlink() {
    const ret = await this.post('unlink', {})
    if (ret.success == true) {
      //logout of this
      this.logout()
    }
  }

  async http(baseUrl, url, body, method) {
    const response = await this.fetch(appendSlash(baseUrl) + url, {
      method,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json' }
    })
    const json = await response.json()
    if (response.ok) {
      return json
    }
    return Promise.reject(JSON.stringify(json))
  }

  async post(url, body) {
    try {
      return await this.http(this.serverUrl, url, body, 'POST')
    } catch (error) {
      console.log('Error posting to bridge server:', error)
      return
    }
  }

  async get(url) {
    return this.http(this.serverUrl, url, undefined, 'GET')
  }
}
