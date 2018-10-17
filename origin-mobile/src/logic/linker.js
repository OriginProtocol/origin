'use strict'
import db from '../models/'
import uuidv4 from 'uuid/v4'
import { Op } from 'sequelize'

const CODE_EXPIRATION_TIME_MINUTES = 60
const CODE_SIZE = 16

class Linker {
  constructor({}) {
  }

  _generateNewCode(size) {
    return uuidv4().replace('-', '').substring(0, size)
  }

  async findUnexpiredCode(code) {
    return db.LinkedToken.findAll({where:{'code':code, 'codeExpires':{Op.gte:new Date()}}})
  }

  async findSession(sessionToken, linkedId) {
    return db.LinkedSession.findOne({where:{sessionToken, linkedId}})
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
      const code = await this.__generateNonConflictingCode()
      linkedObj.code = code
      linkedObj.codeExpires = new Date(new Date() + CODE_EXPIRATION_TIME_MINUTES * 60 * 1000)
      linkedObj.app_info = {user-agent:userAgent, return_url:returnUrl}
    }
    await linkedObj.save()

    if (!sessionToken || !await this.findSession(sessionToken, linkedObj.id))
    {
      sessionToken = await this.generateInitSession(linkedObj)
    }



    }
  
  }

  
  getLinkInfo(code) {

  }

  callWallet(clientToken, sessionToken, account, call, return_url) {

  }

  walletCalled(walletToken, callId, sessionToken, call) {

  }

  linkWallet(walletToken, code, currentRpc, currentAccounts) {

  }

  getWalletLinks(walletToken) {

  }

  unlink(clientToken) {

  }

  unlinkWallet(walletToken, linkId) {

  }
}

export default Linker

