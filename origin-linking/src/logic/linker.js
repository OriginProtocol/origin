'use strict'
import db from './../models/'
import uuidv4 from 'uuid/v4'
import { Op } from 'sequelize'
import { MessageTypes,EthNotificationTypes } from 'origin/common/enums'
import MessageQueue from './../utils/message-queue'
import origin, {providerUrl, perfModeEnabled, discoveryServerUrl, web3} from './../services/origin'
import {sha3_224} from 'js-sha3'
import apn from 'apn'

const ATTESTATION_ACCOUNT = process.env.ATTESTATION_ACCOUNT
const DAPP_URL = process.env.DAPP_URL
const MESSAGING_URL = `${DAPP_URL}/#/messages?no-nav=true&skip-onboarding=true&wallet-container=`
const PROFILE_URL = `${DAPP_URL}/#/profile`
const SELLING_URL = `${DAPP_URL}/#/create`
const CODE_EXPIRATION_TIME_MINUTES = 60
const CODE_SIZE = 16

class Linker {
  constructor({}={}) {
    this.messages = new MessageQueue()

    if (process.env.APNS_KEY_FILE)
    {
      this.apnProvider = new apn.Provider({
        token:{
          key:process.env.APNS_KEY_FILE,
          keyId:process.env.APNS_KEY_ID,
          teamId:process.env.APNS_TEAM_ID
        },
        production:process.env.APNS_PRODUCTION?true:false
      })
      this.apnBundle = process.env.APNS_BUNDLE_ID
    }
  }

  _generateNewCode(size) {
    return uuidv4().replace(/-/g, '').substring(0, size)
  }

  async findUnexpiredCode(code) {
    return db.LinkedToken.findAll({where:{code:code, codeExpires:{[Op.gte]:new Date()}}})
  }

  async findLink(clientToken) {
    return db.LinkedToken.findOne({where:{clientToken}})
  }

  getLinkId(rawId, key) {
    return sha3_224(`${rawId}:${key}`).slice(0, 16)
  }

  getWalletToken(linkedObj) {
    if (linkedObj.linked) {
      return linkedObj.walletToken
    }
  }

  async getWalletNotification(walletToken) {
    return await db.WalletNotificationEndpoint.findOne({where:{walletToken}})
  }

  async _generateNonConflictingCode() {
    for(const i of Array(10)) {
      const code = this._generateNewCode(CODE_SIZE)
      const existing = await this.findUnexpiredCode(code)
      if (existing.length == 0)
      {
        return code
      }
    }
    throw("We hit max retries without finding a none repreated code!")
  }

  async initClientSession(clientToken, sessionToken, lastMessageId) {
    const linkObj = await this.findLink(clientToken)
    let init = false
    if (!linkObj) {
      throw("Cannot find link for client token: " + clientToken)
    }
    // if this is a brand new session ignore all current messages
    if (!sessionToken) {
      sessionToken = this.generateInitSession(linkObj)
      init = true
    }
    else if (!lastMessageId) {
      init = true
    }
    else
    {
      const message = await this.messages.getFirstMessage(clientToken)
      if (message && message.msgId > lastMessageId)
      {
        init = true
      }
    }

    if (init)
    {
      lastMessageId = this.messages.getLatestId()
    }

    //set the lastest device context just in case we missed out on some messages
    const initMsg = init && this._getContextMsg(linkObj, sessionToken)
    return {initMsg, sessionToken, lastMessageId}
  }



  //
  // returns a function to call for clean up: cleanUp()
  //    messageFn(message, messageId)
  //
  handleMessages(token, lastMessageId, messageFn) {
    let lastReadId = lastMessageId

    const msgFetch = async () => {
      const messages = await this.messages.getMessages(token, lastReadId)
      for (const {msg, msgId} of messages) {
        if (msgId > lastReadId)
        {
          messageFn(msg, msgId)
          lastReadId = msgId
        }
      }
    }
    // initial fetch for messages
    msgFetch()
    return this.messages.subscribeMessage(token, msgFetch)
  }

  async handleSessionMessages(clientToken, _sessionToken, _lastMessageId, messageFn) {
    const {initMsg, sessionToken, lastMessageId} = await this.initClientSession(clientToken, _sessionToken, _lastMessageId)
    if (initMsg) {
      messageFn(initMsg)
    }

    return this.handleMessages(clientToken, lastMessageId, (msg, msgId) => {
      const {session_token} = msg
      if (!session_token || session_token == sessionToken)
      {
        messageFn(msg, msgId)
      }
    })
  }

  sendWalletMessage(linkedObj, type, data) {
    const walletToken = this.getWalletToken(linkedObj)
    if (walletToken)
    {
      return this.messages.addMessage(walletToken, {type, data})
    }
  }

  sendSessionMessage(linkedObj, sessionToken, type, data) {
    return this.messages.addMessage(linkedObj.clientToken, {type, session_token:sessionToken, data})
  }

  sendNotify(notify, msg, data = {}) {
    if (notify && notify.deviceType == EthNotificationTypes.APN && this.apnProvider)
    {
      const note = new apn.Notification({
        alert:msg,
        sound:'default',
        payload:data,
        topic:this.apnBundle
      })
      this.apnProvider.send(note, notify.deviceToken).then( result => {
        console.log("APNS sent:", result.sent.length);
        console.log("APNS failed:", result.failed);
      });
    }
  }

  async sendNotificationMessage(linkedObj, msg, data) {
    const notify = await this.getWalletNotification(linkedObj.walletToken)
    this.sendNotify(notify, msg, data)
  }

  generateInitSession(linkedObj) {
    const sessionToken = uuidv4()
    return sessionToken
  }

  async generateCode(clientToken, sessionToken, pubKey, userAgent, returnUrl, pendingCall, notifyWallet) {
    let linkedObj
    if (clientToken)
    {
      linkedObj = await db.LinkedToken.findOne({where:{clientToken}})
    }

    if (!linkedObj){
      clientToken = uuidv4()
      linkedObj = await db.LinkedToken.build({clientToken, linked:false})
    }

    // keys have to match
    if (linkedObj.clientPubKey != pubKey)
    {
      console.log("Pub key: ", linkedObj.clientPubKey, " does not match: ", pubKey)
      linkedObj.clientPubKey = pubKey
      linkedObj.linked = false
    }

    if (!linkedObj.linked) {
      const code = await this._generateNonConflictingCode()
      linkedObj.code = code
      linkedObj.codeExpires = new Date(new Date().getTime() + CODE_EXPIRATION_TIME_MINUTES * 60 * 1000)
      linkedObj.appInfo = {user_agent:userAgent, return_url:returnUrl}
    }
    await linkedObj.save()

    if (!sessionToken)
    {
      sessionToken = this.generateInitSession(linkedObj)
    }
    else
    {
      this.sendContextChange(linkedObj, sessionToken)
    }

    if (pendingCall)
    {
      pendingCall.session_token = sessionToken
      linkedObj.pendingCallContext = pendingCall
      linkedObj.save()
    }

    if(linkedObj.code && notifyWallet)
    {
      this.messages.addMessage(notifyWallet, {type:MessageTypes.LINK_REQUEST, data:{code:linkedObj.code}})
    }
    return {clientToken, sessionToken, code:linkedObj.code, linked:linkedObj.linked}
  }
  
  async getLinkInfo(code) {
    const linkedObjs = await this.findUnexpiredCode(code)
    if (linkedObjs.length > 0)
    {
      const linkedObj = linkedObjs[0]
      return {appInfo:linkedObj.appInfo, linkId:this.getLinkId(linkedObj.id, linkedObj.clientToken), pubKey:linkedObj.clientPubKey}
    }
    return {}
  }

  getServerInfo() {
    return {
      providerUrl,
      contractAddresses:origin.contractService.getContractAddresses(),
      ipfsGateway:origin.ipfsService.gateway,
      ipfsApi:origin.ipfsService.api,
      dappUrl:DAPP_URL,
      messagingUrl:MESSAGING_URL,
      profileUrl:PROFILE_URL,
      sellingUrl:SELLING_URL,
      attestationAccount:ATTESTATION_ACCOUNT,
      perfModeEnabled,
      discoveryServerUrl
    }
  }

  async getMetaFromCall({call, net_id, params:{txn_object}}){
    if (txn_object) {
      return origin.reflection.extractContractCallMeta(net_id || txn_object.chainId, txn_object.to, txn_object.data)
    }
  }

  getMessageFromMeta(meta, account) {
    console.log("meta is:", meta)
    if (meta.subMeta)
    {
      meta = meta.subMeta
    }

    if (meta.listing)
    {
      switch(meta.method) {
        case 'createListing':
          return `Confirm your listing for ${meta.listing.title}`
        case 'makeOffer':
          return `Confirm your offer for ${meta.listing.title}`
        case 'withdrawOffer':
          return meta.listing.seller === account ?
            `Confirm the rejection of an offer for ${meta.listing.title}` :
            `Confirm the withdrawal of an offer for ${meta.listing.title}`
        case 'acceptOffer':
          return `Confirm the acceptance of an offer for ${meta.listing.title}`
        case 'dispute':
          return `Confirm your reporting of a problem ${meta.listing.title}`
        case 'finalize':
          return `Confirm the release of funds for ${meta.listing.title}`
        case 'addData':
          return `Confirm your review from selling ${meta.listing.title}`
        default:
          return `${meta.method} pending for ${meta.listing.title}`
      }
    }
    else if (meta.identity)
    {
      return 'Confirm the publishing of your identity'
    }
    else
    {
      if (meta.contract && meta.method)
      {
        return `Pending call to ${meta.contract}.${meta.method}`
      }
      else
      {
        return `There is a pending call for your approval`
      }
    }
  }

  async callWallet(clientToken, sessionToken, account, call_id, call, return_url) {
    if (!clientToken || !sessionToken){
      return false
    }
    const linkedObj = await this.findLink(clientToken)
    if (!linkedObj || !linkedObj.linked) {
      return false
    }
    const call_data = {call_id, call, link_id:this.getLinkId(linkedObj.id, linkedObj.clientToken), session_token:sessionToken, return_url, account}

    const meta = await this.getMetaFromCall(call)

    await this.sendWalletMessage(linkedObj, MessageTypes.CALL, call_data)

    // send push notification via APN or fcm
    await this.sendNotificationMessage(linkedObj, this.getMessageFromMeta(meta || {}, account), {call_id})
  }

  async walletCalled(walletToken, callId, linkId, sessionToken, result) {
    const links = await db.LinkedToken.findAll({where:{walletToken, linked:true}})

    let linkedObj = null
    for (const link of links) {
      if (linkId == this.getLinkId(link.id, link.clientToken))
      {
        linkedObj = link
      }
    }
    if (!linkedObj) {
      throw("Session not linked")
    }

    const response = {call_id:callId, result}
    this.sendSessionMessage(linkedObj, sessionToken, MessageTypes.CALL_RESPONSE, response)
    return true
  }

  _getContextMsg(linkedObj, sessionToken) {
    const linked = linkedObj.linked
    return { type:MessageTypes.CONTEXT, 
      data:{session_token:sessionToken, linked, device:linked && linkedObj.currentDeviceContext}}
  }

  async sendContextChange(linkedObj, sessionToken) {
    const {type, data} = this._getContextMsg(linkedObj)
    return this.sendSessionMessage(linkedObj, sessionToken, type, data)
  }

  async linkWallet(walletToken, code, current_rpc, current_accounts, priv_data) {
    const linkedCodeObjs = await this.findUnexpiredCode(code)
    if (!linkedCodeObjs || linkedCodeObjs.length != 1)
    {
      throw("Cannot find code to link to.")
    }
    const linkedObj = linkedCodeObjs[0]

    const pendingCallContext = linkedObj.pendingCallContext
    const appInfo = linkedObj.appInfo

    const notify = await this.getWalletNotification(walletToken)

    linkedObj.walletToken = walletToken
    linkedObj.linked = true
    linkedObj.code = null
    linkedObj.currentDeviceContext = {accounts:current_accounts, network_rpc:current_rpc, priv_data}
    linkedObj.linkedAt = new Date()
    linkedObj.pendingCallContext = null

    //send a global session message
    this.sendContextChange(linkedObj)
    await linkedObj.save()

    return {pendingCallContext, appInfo, linked:true, linkId:this.getLinkId(linkedObj.id, linkedObj.clientToken), linkedAt:linkedObj.linkedAt}
  }

  async prelinkWallet(walletToken, pub_key, current_rpc, current_accounts, priv_data) {
    const clientToken = uuidv4()
    const code = await this._generateNonConflictingCode()
    const codeExpires = new Date(new Date().getTime() + CODE_EXPIRATION_TIME_MINUTES * 60 * 1000)

    const currentDeviceContext = {accounts:current_accounts, network_rpc:current_rpc, priv_data}
    const linkedObj = await db.LinkedToken.build({code, codeExpires, clientPubKey:pub_key, clientToken, currentDeviceContext,
      walletToken, linked:false})

    //send a global session message
    const result = await linkedObj.save()
    return {code, linkId:this.getLinkId(result.id, result.clientToken)}
  }

  async linkPrelinked(code, linkId,  userAgent, returnUrl)
  {
    const linkedCodeObjs = await this.findUnexpiredCode(code)
    if (!linkedCodeObjs || linkedCodeObjs.length != 1)
    {
      throw("Cannot find code to link to.")
    }
    const linkedObj = linkedCodeObjs[0]
    const matchLinkId = this.getLinkId(linkedObj.id, linkedObj.clientToken)
    if (linkId != matchLinkId)
    {
      throw("Incorrect code given: "+ linkId +  ' != ' +  matchLinkId)
    }

    const sessionToken = this.generateInitSession(linkedObj)

    linkedObj.sessionToken = sessionToken
    linkedObj.linked = true
    linkedObj.code = null
    linkedObj.linkedAt = new Date()
    linkedObj.pendingCallContext = null
    linkedObj.appInfo = {user_agent:userAgent, return_url:returnUrl, prelinked:true}
    await linkedObj.save()
    this.sendContextChange(linkedObj, sessionToken)

    return {clientToken:linkedObj.clientToken, sessionToken, linked:linkedObj.linked}
  }

  async getWalletLinks(walletToken) {
    const links = await db.LinkedToken.findAll({where:{walletToken, linked:true}})
    return links.map(link => ({linked:link.linked, app_info:link.appInfo,  link_id:this.getLinkId(link.id, link.clientToken), linked_at:link.linkedAt, pub_key:link.clientPubKey}))
  }

  async updateWalletLinks(walletToken, updates) {
    const links = await db.LinkedToken.findAll({where:{walletToken, linked:true}})
    let update_count = 0

    for (const link of links)
    {
      const link_id = this.getLinkId(link.id, link.clientToken)
      if(updates[link_id])
      {
        const {current_rpc, current_accounts, priv_data}  = updates[link_id]
        link.currentDeviceContext = {accounts:current_accounts, network_rpc:current_rpc, priv_data}
        //send a global session message
        this.sendContextChange(link)
        link.save()
        update_count +=1
      }
    }
    return update_count
  }


  async unlink(clientToken) {
    const linkedObj = await this.findLink(clientToken)
    if (!linkedObj || !linkedObj.linked)
    {
      return true
    }

    linkedObj.linked = false
    linkedObj.save()

    this.sendContextChange(linkedObj)
    return true
  }

  async unlinkWallet(walletToken, linkId) {
    const links = await db.LinkedToken.findAll({where:{walletToken, linked:true}})

    for (const link of links) {
      if (linkId == this.getLinkId(link.id, link.clientToken))
      {
        link.linked = false
        link.walletToken = null
        link.save()
        this.sendContextChange(link)
        return true
      }
    }
    return false
  }

  async registerWalletNotification(walletToken, ethAddress, deviceType, deviceToken) {
    let notify = await this.getWalletNotification(walletToken)
      
    if (!notify)
    {
      notify = await db.WalletNotificationEndpoint.build({walletToken})
    }

    Object.assign(notify, {ethAddress, deviceType, deviceToken})
    await notify.save()
    return true
  }

  async ethNotify(receivers) {
    for (const [_ethAddress, notifyObj] of Object.entries(receivers))
    {
      const ethAddress = web3.utils.toChecksumAddress(_ethAddress)
      console.log("Notifying:", ethAddress, " obj ", notifyObj)
      const notify = await db.WalletNotificationEndpoint.findOne({where:{ethAddress}})

      if (notifyObj.newMessage && !notifyObj.msg)
      {
        this.sendNotify(notify, "New message for: " +ethAddress, {newMessage:true})
      }
      else if (notifyObj.msg)
      {
        const msg = notifyObj.msg
        delete notifyObj.msg
        this.sendNotify(notify, msg, notifyObj)
      }
    }
  }
}



export default Linker
