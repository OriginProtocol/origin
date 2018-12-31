import AttestationObject from '../models/attestation'
import { encode as rlpEncode } from 'rlp'
import UsersResolver from '../contractInterface/users/resolver'
import Web3 from 'web3'

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}

const responseToUrl = (resp = {}) => {
  return resp['url']
}

/* - IPFS hash is a base58 encoded string
   - We store IPFS hashes in solidity claims in bytes32 binary format to minimise
     gas cost.
   - bytes32 is not string serialisable so it can not be transmitted in that form
     from bridge to the DApp
   - bridge needs to transform ipfs hash to bytes32 format (that is how
     it is going to be stored in the contract) before signing the claim, and then
     send IPFS hash to the DApp in base58 string encoding.
   - this way claim has a correct signature if IPFS hash has bytes32 hex encoding
   - the DApp takes signature and other claim info and transforms the base58 encoded
     IPFS hash to base32 hex before submitting the claim to web3.
*/
export const ClaimDataIsIpfsHash = [4, 5] // twitter & airbnb

export class Attestations {
  constructor({ serverUrl, contractService, fetch, blockEpoch }) {
    this.serverUrl = serverUrl
    this.contractService = contractService
    this.fetch = fetch
    this.usersResolver = new UsersResolver({ contractService, blockEpoch })

    this.responseToAttestation = (resp = {}) => {
      const topic = resp['claim-type']
      return new AttestationObject({
        topic: topic,
        data: ClaimDataIsIpfsHash.includes(topic) ?
          contractService.getBytes32FromIpfsHash(resp['data']) :
          Web3.utils.soliditySha3(resp['data']),
        signature: resp['signature']
      })
    }
  }

  async getIdentityAddress(wallet) {
    const currentAccount = await this.contractService.currentAccount()
    wallet = wallet || currentAccount
    const identityAddress = await this.usersResolver.identityAddress(wallet)
    if (identityAddress) {
      return Web3.utils.toChecksumAddress(identityAddress)
    } else {
      return this.predictIdentityAddress(wallet)
    }
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

  async predictIdentityAddress(wallet) {
    const web3 = this.contractService.web3
    const nonce = await new Promise(resolve => {
      web3.eth.getTransactionCount(wallet, (err, count) => {
        resolve(count)
      })
    })
    const address =
      '0x' + Web3.utils.sha3(rlpEncode([wallet, nonce])).substring(26, 66)
    return Web3.utils.toChecksumAddress(address)
  }
}
