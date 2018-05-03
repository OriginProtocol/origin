import fetch from "cross-fetch"
import RLP from "rlp"
import web3Utils from "web3-utils"

const claimTypeMapping = {
  3: "facebook",
  4: "twitter",
  10: "phone",
  11: "email"
}

const appendSlash = (url) => {
  return (url.substr(-1) === "/") ? url : url + "/"
}

class AttestationObject {
  constructor({ claimType, data, signature }) {
    this.claimType = claimType
    this.service = claimTypeMapping[claimType]
    this.data = data
    this.signature = signature
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
        data: web3Utils.sha3(resp['data']),
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
    let address = "0x" + web3Utils.sha3(RLP.encode([wallet, nonce])).substring(26, 66)
    return web3Utils.toChecksumAddress(address)
  }

  async getIdentityAddress(wallet) {
    let userRegistry = await this.contractService.userRegistryContract.deployed()
    let identityAddress = await userRegistry.users(wallet)
    let hasRegisteredIdentity = identityAddress !== "0x0000000000000000000000000000000000000000"
    if (hasRegisteredIdentity) {
      return web3Utils.toChecksumAddress(identityAddress)
    } else {
      return this.predictIdentityAddress(wallet)
    }
  }

  async phoneGenerateCode({ phone }) {
    return await this.post("phone/generate-code", { phone })
  }

  async phoneVerify({ wallet, phone, code }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "phone/verify",
      {
        identity,
        phone,
        code
      },
      this.responseToAttestation
    )
  }

  async emailGenerateCode({ email }) {
    return await this.post("email/generate-code", { email })
  }

  async emailVerify({ wallet, email, code }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "email/verify",
      {
        identity,
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

  async facebookVerify({ wallet, redirectUrl, code }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "facebook/verify",
      {
        identity,
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

  async twitterVerify({ wallet, oauthVerifier }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "twitter/verify",
      {
        identity,
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
