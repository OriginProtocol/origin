'use strict'

const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const app = require('../src/index')
const {
  Conversee,
  Conversation,
  Message,
  Registry
} = require('./../src/models/index')

const Eth = require('web3-eth')

const secp256k1 = require('secp256k1')
const ecies = require('eth-ecies')
const CryptoJS = require('crypto-js')

const stringify = require('json-stable-stringify')

const Web3Eth = new Eth()

const USER_ADDRESS_1 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const USER_PRIVATE_KEY =
  '0xC87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3'
const USER_ACCOUNT = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY)

const USER_ADDRESS_2 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
const USER_PRIVATE_KEY_2 =
  '0xAE6AE8E5CCBFB04590405997EE2D52D2B330726137B875053C36D94E974D162F'
const USER_ACCOUNT_2 = Web3Eth.accounts.privateKeyToAccount(USER_PRIVATE_KEY_2)

const PROMPT_MESSAGE = 'PROMPT_MESSAGE'
const PROMPT_PUB_KEY = 'PROMPT_PUB_KEY'

function generateMessagingAccount(seed, userAccount) {
  const signature = userAccount.sign(seed).signature
  const signKey = signature.substring(0, 66)

  // Creating a new key pair
  const account = Web3Eth.accounts.privateKeyToAccount(signKey)
  const publicKey =
    '0x' +
    secp256k1
      .publicKeyCreate(new Buffer(signKey.substring(2), 'hex'), false)
      .slice(1)
      .toString('hex')

  return {
    account,
    publicKey
  }
}

async function registerMessagingAccount(userAccount, userAddress) {
  const newAccount = generateMessagingAccount(PROMPT_MESSAGE, userAccount)

  const dataToSign = PROMPT_PUB_KEY + newAccount.account.address
  const signature = userAccount.sign(dataToSign).signature

  const newAccountSign = newAccount.account.sign('TestingThis').signature

  await request(app)
    .post(`/accounts/${userAddress}`)
    .send({
      signature,
      data: {
        msg: dataToSign,
        address: newAccount.account.address,
        pub_key: newAccount.publicKey,
        ph: 'TestingThis',
        phs: newAccountSign
      }
    })
    .expect(200)

  const entry = await Registry.findOne({
    where: {
      ethAddress: userAddress
    }
  })

  expect(entry).not.null
  expect(entry.signature).to.equal(signature)
}

const encryptPayload = (payload, pubKey) => {
  return ecies
    .encrypt(new Buffer(pubKey.substring(2), 'hex'), new Buffer(payload))
    .toString('hex')
}

const decryptPayload = (payload, privateKey) => {
  return ecies
    .decrypt(
      new Buffer(privateKey.substring(2), 'hex'),
      new Buffer(payload, 'hex')
    )
    .toString('utf8')
}

describe('messaging server', () => {
  before(async () => {
    await Registry.destroy({
      where: {},
      truncate: true
    })
    await Message.destroy({
      where: {},
      truncate: true
    })
    await Conversee.destroy({
      where: {},
      truncate: true
    })
    await Conversation.destroy({
      where: {}
    })
  })

  it('should allow users to publish messaging key and signature', async () => {
    await registerMessagingAccount(USER_ACCOUNT, USER_ADDRESS_1)
    await registerMessagingAccount(USER_ACCOUNT_2, USER_ADDRESS_2)
  })

  it('should return the count of all registered accounts', async () => {
    const response = await request(app).get('/accounts')

    expect(response.body.count).to.equal(2)
  })

  it('should return accounts registered form registry', async () => {
    const response = await request(app)
      .get(`/accounts/${USER_ACCOUNT.address}`)
      .expect(200)

    expect(response.body.address).to.equal(
      '0xC4Fa43A3ed43724f995489746c6b98093Ba4daDf'
    )
    expect(response.body.msg).to.equal(
      'PROMPT_PUB_KEY0xC4Fa43A3ed43724f995489746c6b98093Ba4daDf'
    )
    expect(response.body.pub_key).to.equal(
      '0x6d5e424a00ef2270f08059bbf886ac834fee09896b8aba0ccb57c67527cc90bbe75b287167f21b3311b5b244fc8d9563bedc72fc9a3bf1e37948161246391b57'
    )
    expect(response.body.ph).to.equal('TestingThis')
    expect(response.body.phs).to.equal(
      '0xf827a9d40c749786351f3c5f672bf19a3ad8474478ae061948a165266ff4ac6b20a80c755031ccc2740452b2ec9e7d3c7007da0ff36b076c4e7d217c18c827691b'
    )
  })

  it('should return 204 if not registered', async () => {
    await request(app)
      .get(`/accounts/0x0000000000000000000000000000000000000000`)
      .expect(204)
  })

  it('should throw if invalid address', async () => {
    const response = await request(app)
      .get(`/accounts/0x1`)
      .expect(400)

    expect(response.res.statusMessage).to.equal(
      `Address '0x1' is not a valid Ethereum address`
    )
  })

  it('should allow a conversation to be started', async () => {
    const msgAccount1 = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT)
    const msgAccount2 = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT_2)

    const content = {
      type: 'keys',
      address: USER_ADDRESS_1,
      keys: [
        {
          ekey: encryptPayload('randomstring', msgAccount1.publicKey),
          maddress: msgAccount1.account.address,
          address: USER_ADDRESS_1
        },
        {
          ekey: encryptPayload('randomstring', msgAccount2.publicKey),
          maddress: msgAccount2.account.address,
          address: USER_ADDRESS_2
        }
      ]
    }

    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const payload = stringify({
      conversationId: roomId,
      conversationIndex: 0,
      content
    })

    const signature = msgAccount1.account.sign(payload).signature

    const response = await request(app)
      .post(`/messages/${roomId}/0`)
      .send({
        content,
        signature
      })
      .expect(200)

    expect(response.body.created).to.equal(1)
  })

  it('should fetch and decrypt conversation keys', async () => {
    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const msgAccount1 = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT)
    const msgAccount2 = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT_2)

    const response = await request(app).get(`/messages/${roomId}/keys`)

    const keypair = response.body[0]

    expect(response.body.length).to.equal(1)
    expect(keypair.conversationIndex).to.equal(0)
    expect(keypair.address).to.equal(
      '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
    )
    expect(keypair.read).to.equal(true)
    expect(keypair.content.type).to.equal('keys')
    expect(keypair.content.address).to.equal(
      '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
    )
    expect(keypair.content.keys[0].address).to.equal(
      '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
    )
    expect(keypair.content.keys[0].maddress).to.equal(
      '0xC4Fa43A3ed43724f995489746c6b98093Ba4daDf'
    )
    expect(keypair.content.keys[1].address).to.equal(
      '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
    )
    expect(keypair.content.keys[1].maddress).to.equal(
      '0x529aBCeEB20B17338D1627A16661ed49C991f87F'
    )

    // Decrypting with private key
    const decryptedKey = decryptPayload(
      keypair.content.keys[0].ekey,
      msgAccount1.account.privateKey
    )
    expect(decryptedKey).to.equal('randomstring')
    const decryptedKey2 = decryptPayload(
      keypair.content.keys[1].ekey,
      msgAccount2.account.privateKey
    )
    expect(decryptedKey2).to.equal('randomstring')
  })

  it('should allow messages to be added to the conversation', async () => {
    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const msgAccount = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT)

    const key1 = 'randomstring' // This is to be decrypted from `keys`

    const iv = 6

    const encryptedMessage = CryptoJS.AES.encrypt('hello', key1, iv).toString()

    const content = {
      type: 'msg',
      address: USER_ADDRESS_1,
      emsg: encryptedMessage,
      i: iv
    }

    const payload = stringify({
      conversationId: roomId,
      conversationIndex: 1,
      content
    })

    const signature = msgAccount.account.sign(payload).signature

    const response = await request(app)
      .post(`/messages/${roomId}/1`)
      .send({
        content,
        signature
      })
      .expect(200)

    expect(response.body.created).to.equal(1)
  })

  it('should allow messages from counterparty to be added to the conversation', async () => {
    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const msgAccount = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT_2)

    const key1 = 'randomstring'

    const iv = 6

    const encryptedMessage = CryptoJS.AES.encrypt('hello', key1, iv).toString()

    const content = {
      type: 'msg',
      address: USER_ADDRESS_2,
      emsg: encryptedMessage,
      i: iv
    }

    const payload = stringify({
      conversationId: roomId,
      conversationIndex: 2,
      content
    })

    const signature = msgAccount.account.sign(payload).signature

    const response = await request(app)
      .post(`/messages/${roomId}/2`)
      .send({
        content,
        signature
      })
      .expect(200)

    expect(response.body.created).to.equal(1)
  })

  it('should fail if index is out of order', async () => {
    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const msgAccount = generateMessagingAccount(PROMPT_MESSAGE, USER_ACCOUNT_2)

    const key1 = 'randomstring'

    const iv = 6

    const encryptedMessage = CryptoJS.AES.encrypt('hello', key1, iv).toString()

    const content = {
      type: 'msg',
      address: USER_ADDRESS_2,
      emsg: encryptedMessage,
      i: iv
    }

    const payload = stringify({
      conversationId: roomId,
      conversationIndex: 10,
      content
    })

    const signature = msgAccount.account.sign(payload).signature

    const response = await request(app)
      .post(`/messages/${roomId}/10`)
      .send({
        content,
        signature
      })
      .expect(400)

    expect(response.text).to.equal('cannot create message')
  })

  it('should get and decrypt messages from a conversation', async () => {
    const roomId = [USER_ADDRESS_1, USER_ADDRESS_2].sort().join('-')

    const key1 = 'randomstring'

    const response = await request(app).get(`/messages/${roomId}`)

    expect(response.body.length).to.equal(2)

    response.body.map(msg => {
      expect(msg.read).to.equal(false)
      expect(msg.isKeys).to.equal(false)
      expect(msg.content.type).to.equal('msg')

      const buffer = CryptoJS.AES.decrypt(msg.content.emsg, key1, msg.content.i)

      expect(buffer.toString(CryptoJS.enc.Utf8)).to.equal('hello')
    })
  })
})
