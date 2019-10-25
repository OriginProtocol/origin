const chai = require('chai')
const expect = chai.expect
const nock = require('nock')
const request = require('supertest')
const Eth = require('web3-eth')

const stringify = require('json-stable-stringify')

global.fetch = require('cross-fetch')

import AuthClient from '../src/auth-client'

const Web3Eth = new Eth()

const USER_ADDRESS = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const USER_PRIVATE_KEY =
  '0xC87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3'
const USER_ACCOUNT = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY)

const AUTH_SERVER_HOST = 'http://localhost:5200' // 'https://auth.originprotocol.com'

const AUTH_MESSAGE = 'SOME_AUTH_MESSAGE'

const signAuthMessage = (timestamp = Date.now()) => {
  const payload = stringify({
    message: AUTH_MESSAGE,
    timestamp
  })

  return {
    signature: USER_ACCOUNT.sign(payload).signature,
    payload: JSON.parse(payload),
    timestamp
  }
}

describe('Auth Client', () => {
  it('should create a new instance', async () => {
    const client = new AuthClient({
      authServer: AUTH_SERVER_HOST,
      autoGenerate: false,
      activeWallet: USER_ADDRESS,
      disablePersistence: true
    })

    const { signature, payload } = signAuthMessage()

    const authToken = await client.getTokenWithSignature(signature, payload)
    console.log(authToken)
  })
})
