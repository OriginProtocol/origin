'use strict'
import db from './../models/'
import uuidv4 from 'uuid/v4'
import { Op } from 'sequelize'
import { MessageTypes,EthNotificationTypes } from 'origin/common/enums'
import MessageQueue from './../utils/message-queue'
import origin, {providerUrl, mobilize} from './../services/origin'
import {sha3_224} from 'js-sha3'
import apn from 'apn'



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
        }
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
      return `${linkedObj.deviceType}:${linkedObj.deviceToken}`
    }
  }

  parseWalletToken(walletToken) {
    const parts = walletToken.split(':')
    return {deviceType:parts[0], deviceToken:parts.slice(1).join(':')}
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

  sendNotificationMessage(linkedObj, msg, data ={}) {
    if (linkedObj.deviceType == EthNotificationTypes.APN && this.apnProvider)
    {
      const note = new apn.Notification({
        alert:msg,
        sound:'default',
        payload:data,
        topic:this.apnBundle
      })
      this.apnProvider.send(note, linkedObj.deviceToken)
    }
  }

  generateInitSession(linkedObj) {
    const sessionToken = uuidv4()
    return sessionToken
  }

  async generateCode(clientToken, sessionToken, pubKey, userAgent, returnUrl, pendingCall) {
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

  getWeb3Info() {
    return {providerUrl:mobilize(providerUrl), contractAddresses:origin.contractService.getContractAddresses()}
  }

  async getMetaFromCall({call, net_id, params:{txn_object}}){
    if (txn_object) {
      return origin.reflection.extractContractCallMeta(net_id || txn_object.chainId, txn_object.to, txn_object.data)
    }
  }

  getMessageFromMeta(meta) {
    if (meta.subMeta)
    {
      meta = subMeta
    }

    if (meta.listing)
    {
        return `${meta.method} pending for ${meta.listing.title}`
    }
    else
    {
      return `Pending call to ${meta.contract}.${meta.method}`
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
    this.sendNotificationMessage(linkedObj, this.getMessageFromMeta(meta), {call_id})
  }

  async walletCalled(walletToken, callId, linkId, sessionToken, result) {
    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)
    const links = await db.LinkedToken.findAll({where:{deviceType, deviceToken, linked:true}})

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

    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)

    linkedObj.deviceToken = deviceToken
    linkedObj.deviceType = deviceType
    linkedObj.linked = true
    linkedObj.code = null
    linkedObj.currentDeviceContext = {accounts:current_accounts, network_rpc:current_rpc, priv_data}
    linkedObj.linkedAt = new Date()
    linkedObj.pendingCallContext = null

    //send a global session message
    this.sendContextChange(linkedObj)
    linkedObj.save()

    return {pendingCallContext, appInfo, linked:true, linkId:this.getLinkId(linkedObj.id, linkedObj.clientToken), linkedAt:linkedObj.linkedAt}
  }

  async getWalletLinks(walletToken) {
    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)

    const links = await db.LinkedToken.findAll({where:{deviceType, deviceToken, linked:true}})
    return links.map(link => ({linked:link.linked, app_info:link.appInfo,  link_id:this.getLinkId(link.id, link.clientToken), linked_at:link.linkedAt, pub_key:link.clientPubKey}))
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
    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)
    const links = await db.LinkedToken.findAll({where:{deviceType, deviceToken, linked:true}})

    for (const link of links) {
      if (linkId == this.getLinkId(link.id, link.clientToken))
      {
        link.linked = false
        link.deviceType = null
        link.deviceToken = null
        link.save()
        this.sendContextChange(link)
        return true
      }
    }
    return false
  }
}

export default Linker
