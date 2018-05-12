import RLP from "rlp"
import Web3 from "web3"

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
    claimType = Number(claimType)
    this.claimType = claimType
    this.service = claimTypeMapping[claimType]
    this.data = data
    this.signature = signature
  }
}

let responseToUrl = (resp = {}) => {
  return resp['url']
}

class Attestations {
  constructor({ serverUrl, contractService, fetch }) {
    this.serverUrl = serverUrl
    this.contractService = contractService
    this.fetch = fetch

    this.responseToAttestation = (resp = {}) => {
      return new AttestationObject({
        claimType: resp['claim-type'],
        data: Web3.utils.soliditySha3(resp['data']),
        signature: resp['signature']
      })
    }
  }

  async getIdentityAddress(wallet) {
    let currentAccount = await this.contractService.currentAccount()
    wallet = wallet || currentAccount
    let userRegistry = await this.contractService.deployed(this.contractService.userRegistryContract)
    let identityAddress = await userRegistry.methods.users(wallet).call()
    let hasRegisteredIdentity = identityAddress !== "0x0000000000000000000000000000000000000000"
    if (hasRegisteredIdentity) {
      return Web3.utils.toChecksumAddress(identityAddress)
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

  async facebookAuthUrl() {
    return await this.get(
      `facebook/auth-url`,
      responseToUrl
    )
  }

  async facebookVerify({ wallet, code }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "facebook/verify",
      {
        identity,
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

  async twitterVerify({ wallet, code }) {
    let identity = await this.getIdentityAddress(wallet)
    return await this.post(
      "twitter/verify",
      {
        identity,
        "oauth-verifier": code
      },
      this.responseToAttestation
    )
  }

  async http(baseUrl, url, body, successFn, method) {
    let response = await this.fetch(
      appendSlash(baseUrl) + url,
      {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: { "content-type": "application/json" },
        credentials: 'include'
      }
    )
    let json = await response.json()
    if (response.ok) {
      return successFn ? successFn(json) : json
    }
    return Promise.reject(JSON.stringify(json))
  }

  async post(url, body, successFn) {
    return await this.http(this.serverUrl, url, body, successFn, 'POST')
  }

  async get(url, successFn) {
    return await this.http(this.serverUrl, url, undefined, successFn, 'GET')
  }

  async predictIdentityAddress(wallet) {
    let web3 = this.contractService.web3
    let nonce = await new Promise((resolve, reject) => {
      web3.eth.getTransactionCount(wallet, (err, count) => {
        resolve(count)
      })
    })
    let address = "0x" + Web3.utils.sha3(RLP.encode([wallet, nonce])).substring(26, 66)
    return Web3.utils.toChecksumAddress(address)
  }
}

module.exports = {
  AttestationObject,
  Attestations
}
