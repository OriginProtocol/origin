'use strict'

class InsertOnlyKeystore {
  constructor() {
    this._signVerifyRegistry = {}
  }

  registerSignVerify(dbSig, signFunc, verifyFunc, postFunc) {
    this._signVerifyRegistry[dbSig] = { signFunc, verifyFunc, postFunc }
  }

  getSignVerify(id) {
    const parts = id.split('/')
    const end = parts[parts.length - 1]

    const obj = this._signVerifyRegistry[end]
    if (obj) return obj

    for (const k of Object.keys(this._signVerifyRegistry)) {
      if (k.endsWith('-') && end.startsWith(k)) {
        return this._signVerifyRegistry[k]
      }
    }
  }

  createKey() {
    return ''
  }

  getKey() {
    //for some reason Orbit requires a key for verify to be triggered
    return {
      getPublic: () => '-'
    }
  }

  async importPublicKey(key) {
    return key
  }

  verify(signature, key, data) {
    try {
      const message = JSON.parse(data)
      const obj = this.getSignVerify(message.id)

      console.log(
        `Verifying message: ${message.id}
         Signature: ${signature}`
      )

      if (obj && obj.verifyFunc) {
        if (message.payload.op == 'PUT' || message.payload.op == 'ADD') {
          //verify all for now
          if (obj.verifyFunc(signature, key, message, data)) {
            if (obj.postFunc) {
              obj.postFunc(message)
            }
            return Promise.resolve(true)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }

    return Promise.reject(false)
  }
}

module.exports = InsertOnlyKeystore
