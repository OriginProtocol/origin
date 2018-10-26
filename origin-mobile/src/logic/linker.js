'use strict'
import db from './../models/'
import uuidv4 from 'uuid/v4'
import { Op } from 'sequelize'
import { MessageTypes } from './../common/enums'
import { MessageQeue } from './../utils/message-queue'
import origin from './../services/origin'
import {sha3_224} from 'js-sha3'

const CODE_EXPIRATION_TIME_MINUTES = 60
const CODE_SIZE = 16

class Linker {
  constructor({}) {
    this.messages = new MessageQueue()
  }

  _generateNewCode(size) {
    return uuidv4().replace('-', '').substring(0, size)
  }

  async findUnexpiredCode(code) {
    return db.LinkedToken.findAll({where:{code:code, codeExpires:{Op.gte:new Date()}}})
  }

  async findLinked(clientToken) {
    return db.LinkedToken.findAll({where:{clientToken, linked:true}})
  }

  async findSession(sessionToken, linkedObj) {
    if (linkedObj)
    {
      return db.LinkedSession.findOne({where:{sessionToken, linkedId:linkedObj.id}})
    } else {
      return db.LinkedSession.findOne({where:{sessionToken}})
    }
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

  sendWalletMessage(linkedObj, type, data) {
    const walletToken = this.getWalletToken(linkedObj)
    if (walletToken)
    {
      return this.messages.addMessage(walletToken, {type, data})
    }
  }

  sendSessionMessage(sessionObj, type, data) {
    return this.messages.addMessage(sessionObj.sessionToken, {type, data})
  }

  async sendInitMessages(sessionObj, linkedObj) {
    return this.sendSessionMessage(sessionObj, MessageTypes.CONTEXT, linked_obj.currentDeviceContext)
  }

  async generateInitSession(linkedObj) {
    const sessionToken = uuidv4()
    const sessionObj = await db.LinkedSession.create({sessionToken, linkedId:linkedObj.id})

    if (linkedObj.linked)
    {
      await this.sendInitMessages(sessionObj, linkedObj)
    }
    return sessionToken
  }

  async generateCode(clientToken, sessionToken, userAgent, returnUrl, pendingCall) {
    let linkedObj
    if (clientToken)
    {
      linkedObj = await db.LinkedToken.findOne({clientToken})
    }

    if (!linkedObj){
      clientToken = uuidv4()
      linkedObj = await db.LinkedToken.build({clientToken, linked:false})
    }

    if (!linkedObj.linked) {
      const code = await this._generateNonConflictingCode()
      linkedObj.code = code
      linkedObj.codeExpires = new Date(new Date() + CODE_EXPIRATION_TIME_MINUTES * 60 * 1000)
      linkedObj.app_info = {user_agent:userAgent, return_url:returnUrl}
    }
    await linkedObj.save()

    if (!sessionToken || !await this.findSession(sessionToken, linkedObj))
    {
      sessionToken = await this.generateInitSession(linkedObj)
    }

    if (pendingCall)
    {
      linkedObj.pendingCallContext = {call:pendingCall, session_token:sessionToken}
      linkedObj.save()
    }

    return {clientToken, sessionToken, code:linkedObj.code, linked:linkedObj.linked}
  }
  
  async getLinkInfo(code) {
    const linkedObj = await this.findUnexpiredCode(code)
    if (linkedObj)
    {
      return {appInfo:linkedObj.appInfo, linkId:this.getLinkId(linkedObj.id, linkedObj.clientToken)}
    }
    return {}
  }

  getMetaFromCall({net_id, txn_object}){
    if (txn_object) {
      return origin.decodeContractCall(net_id || txn_object.chainId, txn_object.to, txn_object.data)
    }
  }

  callWallet(clientToken, sessionToken, account, call_id, call, return_url) {
    if (!clientToken || !sessionToken){
      return false
    }
    const linkedObj = await this.findLinked(clientToken)
    if (!linkedObj) {
      return false
    }
    const sessionObj = await this.findSession(sessionToken, linkedObj)
    const call_data = {call_id, call, session_token:sessionToken, return_url, account}

    const meta = this.getMetaFromCall(call)

    this.sendWalletMessage(linkedObj, MessageTypes.CALL, call_data)

    // send push notification via APN or fcm
  }

  walletCalled(walletToken, callId, sessionToken, result) {
    const sessionObj = await this.findSession(sessionToken)
    if (!sessionObj) {
      throw("Session does not exist")
    }
    const linkedObj = await sessionObj.getLinkedToken()
    if (!linkedObj || !this.getWalletToken(linkedObj) == walletToken) {
      throw("Session not linked")
    }

    const response = {call_id:callId, result}
    this.sendSessionMessage(sessionObj, MessageTypes.CALL_RESPONSE, response)
    return true
  }

  linkWallet(walletToken, code, currentDeviceContext) {
    const linkedObj = await this.findUnexpiredCode(code)
    if (!linkedObj)
    {
      throw("Cannot find code to link to.")
    }

    const pendingCallContext = linkedObj.pendingCallContext
    const appInfo = linkedObj.appInfo

    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)

    linkedObj.deviceToken = deviceToken
    linkedObj.deviceType = deviceType
    linkedObj.linked = true
    linkedObj.code = null
    linkedObj.currentDeviceContext = currentDeviceContext
    linkedObj.linkedAt = new Date()
    linkedObj.pendingCallContext = null

    for (const linkedSesion of await db.LinkedSession.findAll({where:{LinkedTokenId:linkedObj.id}})) {
      this.sendInitMessages(linkedSession, linkedObj)
    }
    linkedObj.save()

    return {pendingCallContext, appInfo, linked:true, linkId:this.getLinkId(linkedObj.id, linkedObj.clientToken), linkedAt:linkedObj.linkedAt}
  }

  getWalletLinks(walletToken) {
    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)

    const links = await db.LinkedToken.findAll({where:{deviceType, deviceToken, linked:true}})
    return links.map(link => {linked:link.linked, app_info:link.appInfo,  link_id:this.getLinkId(link.id, link.clientToken)})
  }

  unlink(clientToken) {
    const linkedObj = await this.findLinked(clientToken)
    if (!linkedObj)
    {
      return true
    }

    linkedObj.linked = false
    linkedObj.save()
    return true
  }

  unlinkWallet(walletToken, linkId) {
    const {deviceType, deviceToken} = this.parseWalletToken(walletToken)
    const links = await db.LinkedToken.findAll({where:{deviceType, deviceToken, linked:true}})

    for (const link of links) {
      if (linkId == this.getLinkId(link.id, link.clientToken))
      {
        link.linked = false
        link.deviceType = null
        link.deviceToken = null
        link.save()
        return true
      }
    }
    return false
  }
}

export default Linker
