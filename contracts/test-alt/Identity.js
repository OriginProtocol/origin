import assert from 'assert'
import helper from './_helper'

describe('Identity', async function() {
  let web3, accounts, deploy, acctSha3, randomHex
  let UserIdentity

  before(async function() {
    ({
      web3,
      deploy,
      accounts,
      web3: {
        utils: { randomHex }
      }
    } = await helper(`${__dirname}/..`))

    UserIdentity = await deploy('ClaimHolder', {
      from: accounts[0],
      path: `${__dirname}/../contracts/identity/`
    })
    acctSha3 = web3.utils.keccak256(accounts[0])
  })

  describe.skip('Pre-Auth Identity', async function() {
    it('should deploy successfully', async function() {
      const sig = randomHex(10)
      const data = randomHex(10)
      const url = '1234567890'
      await deploy('Identity', {
        from: accounts[0],
        args: [
          // [1], [3], [accounts[0]], sig, data, url, [sig.length-2], [data.length-2], [url.length]
          [1],
          [3],
          [accounts[0]],
          sig,
          data,
          url,
          [10],
          [10],
          [10]
        ],
        path: `${__dirname}/contracts/identity/`,
      })
    })
  })

  describe('Keys', async function() {
    it('should set a default MANAGEMENT_KEY', async function() {
      const res = await UserIdentity.methods.getKey(acctSha3).call()
      assert.equal(res.purposes.length, 1)
      assert.equal(res.purposes[0], '1')
      assert.equal(res.keyType, '1')
      assert.equal(res.key, acctSha3)
    })

    it('should respond to getKeyPurposes', async function() {
      const res = await UserIdentity.methods.getKeyPurposes(acctSha3).call()
      assert.equal(res.length, 1)
      assert.equal(res[0], '1')
    })

    it('should respond to getKeysByPurpose', async function() {
      const res = await UserIdentity.methods.getKeysByPurpose(1).call()
      assert.deepEqual(res, [acctSha3])
    })

    it('should implement addKey', async function() {
      const newKey = web3.utils.randomHex(32)
      const res = await UserIdentity.methods.addKey(newKey, 1, 1).send()
      assert(res.events.KeyAdded)

      const getKey = await UserIdentity.methods.getKey(newKey).call()
      assert.equal(getKey.key, newKey)
    })

    it('should not allow an existing key to be added', async function() {
      try {
        await UserIdentity.methods.addKey(acctSha3, 1, 1).send()
        assert(false)
      } catch (e) {
        assert(e.message.match(/revert/))
      }
    })

    it('should not allow sender without MANAGEMENT_KEY to addKey', async function() {
      try {
        await UserIdentity.methods.addKey(web3.utils.randomHex(32), 1, 1).send({
          from: accounts[1]
        })
        assert(false)
      } catch (e) {
        assert(e.message.match(/revert/))
      }
    })
  })

  describe('Claims', async function() {
    it('should allow a claim to be added by management account', async function() {
      const response = await UserIdentity.methods
        .addClaim(1, 2, accounts[0], randomHex(32), randomHex(32), 'abc.com')
        .send()
      assert(response.events.ClaimAdded)
    })

    it('should disallow new claims from unrecognized accounts', async function() {
      try {
        await UserIdentity.methods
          .addClaim(1, 2, accounts[0], randomHex(32), randomHex(32), 'abc.com')
          .send({ from: accounts[2] })
        assert(false)
      } catch (e) {
        assert(e.message.match(/revert/))
      }
    })

    it('should have 1 claim by type', async function() {
      const byTopicRes = await UserIdentity.methods.getClaimIdsByTopic(1).call()
      assert.equal(byTopicRes.length, 1)
    })

    it('should respond to getClaim', async function() {
      const claimId = web3.utils.soliditySha3(accounts[0], 1)
      const claim = await UserIdentity.methods.getClaim(claimId).call()
      assert.equal(claim.topic, '1')
    })

    // it('should respond to isClaimValid', async function() {
    //   const claimId = web3.utils.soliditySha3(accounts[0], 1)
    //   const valid = await UserIdentity.methods.isClaimValid(claimId).call()
    //   assert(valid)
    // })

    it('should allow claim to be removed', async function() {
      const claimId = web3.utils.soliditySha3(accounts[0], 1)
      const response = await UserIdentity.methods
        .removeClaim(claimId)
        .send({ from: accounts[0] })
      assert(response.events.ClaimRemoved)

      const claim = await UserIdentity.methods.getClaim(claimId).call()
      assert.equal(claim.topic, '0')
    })
  })

  describe('Executions', async function() {
    it('should allow any account to execute actions', async function() {
      const addClaimAbi = await UserIdentity.methods
        .addClaim(1, 2, accounts[0], randomHex(32), randomHex(32), 'abc.com')
        .encodeABI()

      const response = await UserIdentity.methods
        .execute(UserIdentity.options.address, 0, addClaimAbi)
        .send({
          from: accounts[2]
        })

      assert(response.events.ExecutionRequested)
      assert(!response.events.Approved)
      assert(!response.events.Executed)
    })

    it('should auto-approve executions from MANAGEMENT_KEYs', async function() {
      const addClaimAbi = await UserIdentity.methods
        .addClaim(1, 2, accounts[0], randomHex(32), randomHex(32), 'abc.com')
        .encodeABI()

      const response = await UserIdentity.methods
        .execute(UserIdentity.options.address, 0, addClaimAbi)
        .send({
          from: accounts[0]
        })

      assert(response.events.ExecutionRequested)
      assert(response.events.Approved)
      assert(response.events.ClaimAdded)
      assert(response.events.Executed)
    })
  })

  describe('Approvals', async function() {
    it('should allow MANAGEMENT_KEYs to approve executions', async function() {
      const addClaimAbi = await UserIdentity.methods
        .addClaim(1, 2, accounts[2], randomHex(32), randomHex(32), 'abc.com')
        .encodeABI()

      const response = await UserIdentity.methods
        .execute(UserIdentity.options.address, 0, addClaimAbi)
        .send({ from: accounts[2] })

      assert(response.events.ExecutionRequested)
      assert(!response.events.Approved)

      const id = response.events.ExecutionRequested.returnValues.executionId

      const approval = await UserIdentity.methods
        .approve(id, true)
        .send({ from: accounts[0] })

      assert(approval.events.Approved)
      assert(approval.events.ClaimAdded)
      assert(approval.events.Executed)
    })

    it('should allow ACTION_KEYs to approve executions')
    it('should not allow CLAIM_SIGNER_KEYs to approve executions')
    it('should not be able to approve an already executed execution')
    it('should not be able to approve a non-existant execution')
  })
})
