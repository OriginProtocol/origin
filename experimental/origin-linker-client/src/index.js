import ZeroClientProvider from 'web3-provider-engine/zero'
import uuidv1 from 'uuid/v1'
import secp256k1 from 'secp256k1'
import cryptoRandomString from 'crypto-random-string'
import ecies from 'eth-ecies'
import queryString from 'query-string'
import createDebug from 'debug'

import Session from './session'

const LOCAL_KEY_STORE = 'walletLinker:lks'
const PLACEHOLDER_ADDRESS = '0x3f17f1962B36e491b30A40b2405849e597Ba5FB5'
const API_PATH = '/api/wallet-linker'

const debug = createDebug('linker-client')

// WalletLinkerClient is a client for Origin linking server. It exposes a web3
// provider that routes web3 transactions to the linking server, which then
// forwards the transaction to the mobile wallet app for signing and sending
// to the blockchain.
class WalletLinkerClient {
  constructor({ httpUrl, wsUrl, web3 }) {
    this.httpUrl = httpUrl
    this.wsUrl = wsUrl
    this.web3 = web3
    this.netId = null
    this.messagesWS = null

    // code for linking via QR code
    this.linkCode = null

    // provider stuff
    this.callbacks = {}
    this.pendingCall = null

    this.session = new Session()
    this.session.load()
  }

  // Initiates linking of web3 provider to mobile wallet.
  async link() {
    return await this.generateLinkCode()
  }

  cancelLink() {
    debug('cancelling link')
    this.pending_call = null
    this.linkCode = null
  }

  async unlink() {
    const success = await this.post(`${API_PATH}/unlink`, {})
    if (success) {
      this.session.clear()
      this.session.save()
    }
  }

  // Handles prelinking and streaming of wallet messages.
  async start() {
    debug('start called')
    this.netId = await this.web3.eth.net.getId()

    // Handle prelink code from DApp if these is one.
    const hash = window.location.hash
    const search =
      window.location.search || (hash && hash.substr(hash.indexOf('?')))
    let prelinked = false
    if (this.lastSearch !== search) {
      this.lastSearch = search

      const params = queryString.parse(search)
      const plink = params['plink']
      if (plink) {
        // We do not handle wait for this promise to resolve, because prelinking
        // changes internal state that will trigger a UI refresh anyway.
        try {
          await this.prelink(plink)
          prelinked = true
        } catch (e) {
          console.error('prelink error:', e)
        }
      }
    }

    // If there is no prelink but we have a session, we're ready to stream
    // messages from the server.
    if (!prelinked && this.session.token) {
      this.streamWalletMessages()
    } else {
      debug('not linked')
    }
  }

  // Verify the prelink token with the linking server and update local link
  // state based on server response.
  async prelink(plink) {
    debug('preLink called')
    const [linkId, code, privKey] = plink.split('-')
    if (linkId && code && privKey) {
      debug(`prelinking: link id ${linkId} code ${code} private key ${privKey}`)
      const url = `${API_PATH}/link-prelinked`
      const resp = await this.post(url, {
        code,
        link_id: linkId,
        priv_key: privKey
      })
      debug('prelink response:', resp)
      const sessionToken = resp.session_token
      this.session.linked = resp.linked
      if (this.session.linked && privKey) {
        localStorage.setItem(LOCAL_KEY_STORE, privKey)
      }
      if (this.session.token !== sessionToken) {
        this.session.token = sessionToken
        this.streamWalletMessages()
      }
      this.session.save()
    } else {
      debug('wallet already prelinked')
    }
  }

  // Returns a serialized web3 transaction for the linking server.
  createCall(method, params) {
    return {
      method,
      net_id: this.netId,
      params
    }
  }

  // web3 provider function: returns linked accounts
  getAccounts(callback) {
    if (callback) {
      callback(undefined, this.session.accounts)
    } else {
      return new Promise(resolve => {
        resolve(this.session.accounts)
      })
    }
  }

  // web3 provider function: processes Ethereum transactions. If the wallet
  // is unlinked, we generate a request for a QR code and embed the transaction
  // in that request. If the wallet is already linked, we submit the transaction
  // to the linking server, which forwards it to the mobile wallet for
  // confirmation and execution.
  processTransaction(txn, callback) {
    debug('processTransaction called', txn)
    txn.gasLimit = txn.gas

    if (txn.from.toLowerCase() === PLACEHOLDER_ADDRESS.toLowerCase()) {
      // If we're linking and performing a transaction, we can leave txn.from
      // as undefined, and the mobile wallet will fill it in for us.
      txn.from =
        this.session.accounts.length > 0 ? this.session.accounts[0] : undefined
    }

    const callId = uuidv1()
    this.callbacks[callId] = async data => callback(undefined, data.hash)

    const call = this.createCall('processTransaction', { txn_object: txn })
    if (!this.session.linked) {
      // We're not linked, so the current transaction is pending a successful
      // wallet link.
      this.pendingCall = { callId, call }
      // We let this async call run on its own. It's up to the UI to check for
      // updates to linkCode and display it.
      this.generateLinkCode()
      return
    }

    // Forward the transaction to the mobile wallet via the linking server.
    const callWalletUrl = `${API_PATH}/call-wallet/${this.session.token}`
    const body = {
      call_id: callId,
      accounts: this.session.accounts,
      call,
      return_url: this.getReturnUrl()
    }
    debug(`sending transaction from`, call.params.txn_object.from)
    const resp = this.post(callWalletUrl, body)
    resp
      .then(() => {})
      .catch(err => {
        delete this.callbacks[callId]
        callback(err)
      })
  }

  // Returns a web3 provider that forwards requests to the mobile wallet.
  getProvider() {
    const rpcUrl = this.web3.eth.net.currentProvider.host
    const provider = ZeroClientProvider({
      rpcUrl,
      getAccounts: this.getAccounts.bind(this),
      processTransaction: this.processTransaction.bind(this)
    })

    // Disable transaction validation, which interferes with our work.
    const hookedWallet = provider._providers[6]
    if (!hookedWallet.validateTransaction) {
      console.error('The sub provider at [6] is NOT a hooked wallet.')
    } else {
      // Pass through validate for now
      hookedWallet.validateTransaction = (_, cb) => {
        cb()
      }
    }

    // Disable caching subProviders, because they interfere with the provider
    // we're returning.
    provider._providers.splice(3, 1)
    provider._providers.splice(4, 1)
    provider.isOrigin = true
    debug('getProvider returning', provider)
    return provider
  }

  getLinkPrivKey() {
    const localKey = localStorage.getItem(LOCAL_KEY_STORE)
    const privKey = localKey || cryptoRandomString(64).toString('hex')
    if (privKey != localKey) {
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
    return ecies
      .decrypt(new Buffer(priv_key, 'hex'), new Buffer(buffer, 'hex'))
      .toString('utf8')
  }

  // Generates a link code through the linking server, which is an input into
  // the QR codes used for linking to a mobile wallet.
  async generateLinkCode() {
    const body = {
      session_token: this.session.token,
      returnUrl: this.getReturnUrl(),
      pending_call: this.pendingCall && {
        call_id: this.pendingCall.callId,
        call: this.pendingCall.call
      },
      pub_key: this.getLinkPubKey(),
      notify_wallet: this.notifyWallet
    }
    debug('generating link code')
    const resp = await this.post(`${API_PATH}/generate-code`, body)
    debug('got link code response:', resp)
    this.linkCode = resp.link_code
    this.session.linked = resp.linked
    if (this.session.token !== resp.sessionToken) {
      this.session.token = resp.session_token
      this.streamWalletMessages()
    }
    this.session.save()
    return resp.link_code
  }

  // Stop streaming linker messages over our websocket.
  closeWalletMessages() {
    if (
      this.messagesWS &&
      this.messagesWS.readyState !== this.messagesWS.CLOSED
    ) {
      debug('closing wallet messages web socket')
      this.messagesWS.close()
    }
  }

  // Stream mobile wallet messages from the linking server. Not to be confused
  // with Origin Messaging.
  async streamWalletMessages() {
    this.closeWalletMessages()
    if (!this.session.token) {
      throw new Error('Cannot sync messages without session token')
    }
    const sessionToken = this.session.token || '-'
    const messageId = this.session.lastMessageId || 0
    const wsUrl = `${
      this.wsUrl
    }${API_PATH}/linked-messages/${sessionToken}/${messageId}`
    const ws = new WebSocket(wsUrl)
    debug('streaming messages from', wsUrl)

    ws.onmessage = e => this.processWalletMessage(JSON.parse(e.data))

    ws.onclose = e => {
      console.log('messages websocket closed:', e)
      if (e.code != 1000) {
        // If this is an abnormal close, try to reopen soon.
        setTimeout(() => {
          if (this.messagesWS === ws) {
            this.streamWalletMessages()
          }
        }, 30000)
      }
    }

    this.messagesWS = ws
  }

  // Process messages pushed from linking server.
  processWalletMessage(m) {
    const { type, data } = m.msg
    const id = m.msgId

    switch (type) {
      case 'CONTEXT':
        this.handleContextMessage(data)
        break

      case 'CALL_RESPONSE':
        this.handleCallResponse(data)
        break

      default:
        console.error('unknown message', type, data)
    }

    if (id) {
      this.session.lastMessageId = id
      this.session.save()
    }
  }

  // Handles the CONTEXT message, which allows this client to refresh its state,
  // such as wallet link status and linked accounts.
  handleContextMessage(msg) {
    debug('received context message:', msg)
    if (msg.sessionToken) {
      this.session.token = msg.sessionToken
    }

    if (!msg.linked && this.session.linked) {
      // We've been logged out, so clear our state.
      this.session.clear()
      this.session.save()
      return
    }

    this.session.linked = msg.linked
    if (this.session.linked) {
      this.cancelLink()
    }

    const device = msg.device
    if (!device) {
      debug('no device info found')
      this.session.accounts = []
      return
    }

    debug('device info found')
    this.session.accounts = device.accounts
    if (device.priv_data) {
      const data = JSON.parse(this.ecDecrypt(device.priv_data))
      this.session.privData = data
      if (data && data.messaging && this.callbacks['messaging']) {
        debug('got messaging data', data.messaging)
        this.callbacks['messaging'](data.messaging)
      }
    }
  }

  // Called with the results of a web3 transaction that was executed through
  // the mobile wallet.
  handleCallResponse(msg) {
    debug('got call response:', msg)
    if (this.callbacks[msg.call_id]) {
      debug(`performing callback for ${msg.call_id}`)
      this.callbacks[msg.call_id](msg.result)
      delete this.callbacks[msg.call_id]
    }
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

  // Performs an HTTP request to the linking server and returns the JSON
  // response object.
  async httpReq(method, path, body) {
    const url = `${this.httpUrl}${path}`
    const opts = {
      method,
      credentials: 'include',
      body: body && JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    }
    const resp = await fetch(url, opts)
    const json = await resp.json()
    if (!resp.ok) {
      throw new Error(JSON.stringify(json))
    }
    return json
  }

  async post(url, body) {
    return await this.httpReq('POST', url, body)
  }

  registerCallback(callId, cb) {
    debug('registering callback for', callId)
    this.callbacks[callId] = cb
  }
}

export default function Linker(opts) {
  return new WalletLinkerClient(opts)
}
