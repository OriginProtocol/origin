import AttestationObject from '../models/attestation'
import Web3 from 'web3'

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}

const responseToUrl = (resp = {}) => {
  return resp['url']
}

export class Attestations {
  constructor({ serverUrl, contractService, fetch }) {
    this.serverUrl = serverUrl
    this.contractService = contractService
    this.fetch = fetch

    this.responseToAttestation = (resp = {}) => {
      return AttestationObject.create(resp)
    }
  }

  /**
   * Returns the user's identity address, which is the user's eth address.
   * @param {string} wallet - User's eth address. If undefined, current account is used.
   * @return {Promise<string>}
   */
  async getIdentityAddress(wallet) {
    const currentAccount = await this.contractService.currentAccount()
    wallet = wallet || currentAccount
    return Web3.utils.toChecksumAddress(wallet)
  }

  async phoneGenerateCode({ countryCallingCode, phone, method, locale }) {
    return await this.post('phone/generate-code', {
      country_calling_code: countryCallingCode,
      phone,
      method,
      locale
    })
  }

  async phoneVerify({ wallet, countryCallingCode, phone, code }) {
    const identity = await this.getIdentityAddress(wallet)
    return await this.post(
      'phone/verify',
      {
        identity,
        country_calling_code: countryCallingCode,
        phone,
        code
      },
      this.responseToAttestation
    )
  }

  async emailGenerateCode({ email }) {
    return await this.post('email/generate-code', { email })
  }

  async emailVerify({ wallet, email, code }) {
    const identity = await this.getIdentityAddress(wallet)
    return await this.post(
      'email/verify',
      {
        identity,
        email,
        code
      },
      this.responseToAttestation
    )
  }

  async facebookAuthUrl() {
    return await this.get(`facebook/auth-url`, {}, responseToUrl)
  }

  async facebookVerify({ wallet, code }) {
    const identity = await this.getIdentityAddress(wallet)
    return await this.post(
      'facebook/verify',
      {
        identity,
        code
      },
      this.responseToAttestation
    )
  }

  async twitterAuthUrl() {
    return await this.get(`twitter/auth-url`, {}, responseToUrl)
  }

  async twitterVerify({ wallet, code }) {
    const identity = await this.getIdentityAddress(wallet)
    return await this.post(
      'twitter/verify',
      {
        identity,
        'oauth-verifier': code
      },
      this.responseToAttestation
    )
  }

  async airbnbGenerateCode({ wallet, airbnbUserId }) {
    const identity = await this.getIdentityAddress(wallet)

    return await this.get(`airbnb/generate-code`, {
      identity: identity,
      airbnbUserId: airbnbUserId
    })
  }

  async airbnbVerify({ wallet, airbnbUserId }) {
    const identity = await this.getIdentityAddress(wallet)
    return await this.post(
      'airbnb/verify',
      {
        identity,
        airbnbUserId
      },
      this.responseToAttestation
    )
  }

  async http(baseUrl, url, body, successFn, method) {
    const response = await this.fetch(appendSlash(baseUrl) + url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json' },
      credentials: 'include'
    })
    const json = await response.json()
    if (response.ok) {
      return successFn ? successFn(json) : json
    }
    return Promise.reject(JSON.stringify(json))
  }

  async post(url, body, successFn) {
    return await this.http(this.serverUrl, url, body, successFn, 'POST')
  }

  async get(url, parameters, successFn) {
    const objectKeys = Object.keys(parameters)
    let stringParams = objectKeys
      .map(key => key + '=' + parameters[key])
      .join('&')
    stringParams = (objectKeys.length === 0 ? '' : '?') + stringParams

    return await this.http(
      this.serverUrl,
      url + stringParams,
      undefined,
      successFn,
      'GET'
    )
  }
}
