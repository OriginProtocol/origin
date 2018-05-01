import fetch from "cross-fetch"
import RLP from "rlp"
import web3Utils from "web3-utils"

const appendSlash = (url) => {
  return (url.substr(-1) === "/") ? url : url + "/"
}

class AttestationObject {
  constructor({ claimType, data, signature, issuer }) {
    this.claimType = claimType
    this.data = data
    this.signature = signature,
    this.issuer = issuer
  }
}

let responseToUrl = (resp = {}) => {
  return resp['url']
}

let http = async (baseUrl, url, body, successFn, method) => {
  let response = await fetch(
    appendSlash(baseUrl) + url,
    {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { "content-type": "application/json" }
    }
  )
  let json = await response.json()
  if (response.ok) {
    return successFn ? successFn(json) : json
  }
  return Promise.reject(JSON.stringify(json))
}

class Attestations {
  constructor({ serverUrl, issuer, contractService }) {
    this.serverUrl = serverUrl
    this.contractService = contractService

    this.responseToAttestation = (resp = {}) => {
      return new AttestationObject({
        claimType: resp['claim-type'],
        data: resp['data'],
        signature: resp['signature'],
        issuer
      })
    }
  }

  async post(url, body, successFn) {
    return await http(this.serverUrl, url, body, successFn, 'POST')
  }

  async get(url, successFn) {
    return await http(this.serverUrl, url, undefined, successFn, 'GET')
  }

  async predictIdentityAddress(wallet) {
    let web3 = this.contractService.web3
    let nonce = await new Promise((resolve, reject) => {
      web3.eth.getTransactionCount(wallet, (err, count) => {
        resolve(count)
      })
    })
    return "0x" + web3Utils.sha3(RLP.encode([wallet, nonce])).substring(26, 66)
  }

  async phoneGenerateCode({ phone }) {
    return await this.post("phone/generate-code", { phone })
  }

  async phoneVerify({ identity, wallet, phone, code }) {
    if (wallet && !identity) {
      identity = await this.predictIdentityAddress(wallet)
    }
    return await this.post(
      "phone/verify",
      {
        identity: web3Utils.toChecksumAddress(identity),
        phone,
        code
      },
      this.responseToAttestation
    )
  }

  async emailGenerateCode({ email }) {
    return await this.post("email/generate-code", { email })
  }

  async emailVerify({ identity, wallet, email, code }) {
    if (wallet && !identity) {
      identity = await this.predictIdentityAddress(wallet)
    }
    return await this.post(
      "email/verify",
      {
        identity: web3Utils.toChecksumAddress(identity),
        email,
        code
      },
      this.responseToAttestation
    )
  }

  async facebookAuthUrl({ redirectUrl }) {
    return await this.get(
      `facebook/auth-url?redirect-url=${redirectUrl}`,
      responseToUrl
    )
  }

  async facebookVerify({ identity, wallet, redirectUrl, code }) {
    if (wallet && !identity) {
      identity = await this.predictIdentityAddress(wallet)
    }
    return await this.post(
      "facebook/verify",
      {
        identity: web3Utils.toChecksumAddress(identity),
        "redirect-url": redirectUrl,
        code
      },
      this.responseToAttestation
    )
  }

  async twitterAuthUrl() {
    return await this.get(
      `twitter/auth-url`,
      responseToUrl
    )
  }

  async twitterVerify({ identity, wallet, oauthVerifier }) {
    if (wallet && !identity) {
      identity = await this.predictIdentityAddress(wallet)
    }
    return await this.post(
      "twitter/verify",
      {
        identity: web3Utils.toChecksumAddress(identity),
        "oauth-verifier": oauthVerifier
      },
      this.responseToAttestation
    )
  }
}

module.exports = {
  AttestationObject,
  Attestations
}
