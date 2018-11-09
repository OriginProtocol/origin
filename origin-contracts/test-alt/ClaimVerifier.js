import assert from 'assert'
import helper, { contractPath } from './_helper'

describe('ClaimVerifier.sol', async function() {
  let web3, accounts, deploy, prvSigner, pubSigner
  let UserIdentity, ClaimIssuer, ClaimVerifier

  before(async function() {
    ({ deploy, accounts, web3 } = await helper(`${__dirname}/..`))

    prvSigner = web3.utils.randomHex(32)
    pubSigner = web3.eth.accounts.privateKeyToAccount(prvSigner).address

    UserIdentity = await deploy('ClaimHolder', {
      from: accounts[0],
      path: `${contractPath}/identity/`
    })
    ClaimIssuer = await deploy('ClaimHolder', {
      from: accounts[1],
      path: `${contractPath}/identity/`
    })
    ClaimVerifier = await deploy('ClaimVerifier', {
      from: accounts[2],
      args: [ClaimIssuer._address],
      path: `${contractPath}/identity/`
    })
  })

  it('should allow verifier owner to addKey', async function() {
    const key = web3.utils.sha3(pubSigner)
    const result = await ClaimIssuer.methods
      .addKey(key, 3, 1)
      .send({ from: accounts[1] })

    assert(result)
  })

  it('should not allow new listing without identity claim', async function() {
    const res = await ClaimVerifier.methods
      .checkClaim(UserIdentity._address, 3)
      .send({ from: accounts[0] })
    assert(res.events.ClaimInvalid)
  })

  it('should allow identity owner to addClaim', async function() {
    const data = web3.utils.asciiToHex('Verified OK')
    const topic = 3
    const hashed = web3.utils.soliditySha3(UserIdentity._address, topic, data)
    const signed = await web3.eth.accounts.sign(hashed, prvSigner)

    const claimRes = await UserIdentity.methods
      .addClaim(
        topic,
        2,
        ClaimIssuer._address,
        signed.signature,
        data,
        'abc.com'
      )
      .send({ from: accounts[0] })

    assert(claimRes.events.ClaimAdded)
  })

  it('should not allow new listing without identity claim', async function() {
    const res = await ClaimVerifier.methods
      .checkClaim(UserIdentity._address, 3)
      .send({ from: accounts[0] })
    assert(res.events.ClaimValid)
  })
})
