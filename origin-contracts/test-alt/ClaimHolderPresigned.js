import assert from 'assert'
import helper, { contractPath } from './_helper'

const signature_1 =
  '0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c'
const signature_2 =
  '0x061ef9cdd7707d90d7a7d95b53ddbd94905cb05dfe4734f97744c7976f2776145fef298fd0e31afa43a103cd7f5b00e3b226b0d62e4c492d54bec02eb0c2a0901b'

const dataHash_1 =
  '0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9'
const dataHash_2 =
  '0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48'

describe('ClaimHolderPresigned', async function() {
  let accounts, deploy, soliditySha3, userRegistry, claimHolderPresigned,
    attestation_1, attestation_2

  before(async function() {
    ({
      deploy,
      accounts,
      web3: {
        utils: { soliditySha3 }
      }
    } = await helper(`${__dirname}/..`))

    attestation_1 = {
      topic: 1,
      scheme: 1,
      issuer: accounts[1],
      signature: signature_1,
      data: dataHash_1,
      uri: ''
    }
    attestation_2 = {
      topic: 2,
      scheme: 1,
      issuer: accounts[2],
      signature: signature_2,
      data: dataHash_2,
      uri: ''
    }

    userRegistry = await deploy('V00_UserRegistry', {
      from: accounts[3],
      path: `${contractPath}/identity/`
    })
    claimHolderPresigned = await deploy('ClaimHolderPresigned', {
      from: accounts[0],
      path: `${contractPath}/identity/`,
      args: [
        userRegistry._address,
        [attestation_1.topic, attestation_2.topic],
        [attestation_1.issuer, attestation_2.issuer],
        attestation_1.signature + attestation_2.signature.slice(2),
        attestation_1.data + attestation_2.data.slice(2),
        [32, 32]
      ]
    })
  })

  it('should deploy identity with attestations', async function() {
    // Check attestation 1
    const claimId_1 = soliditySha3(
      attestation_1.issuer,
      attestation_1.topic
    )
    const fetchedClaim_1 = await claimHolderPresigned.methods.getClaim(claimId_1).call()
    assert.ok(fetchedClaim_1)
    let {
      topic,
      scheme,
      issuer,
      signature,
      data,
      uri
    } = fetchedClaim_1
    assert.equal(Number(topic), attestation_1.topic)
    assert.equal(Number(scheme), attestation_1.scheme)
    assert.equal(issuer, attestation_1.issuer)
    assert.equal(signature, attestation_1.signature)
    assert.equal(data, attestation_1.data)
    assert.equal(uri, attestation_1.uri)

    // Check attestation 2
    const claimId_2 = soliditySha3(
      attestation_2.issuer,
      attestation_2.topic
    )
    const fetchedClaim_2 = await claimHolderPresigned.methods.getClaim(claimId_2).call()
    assert.ok(fetchedClaim_2);
    ({
      topic,
      scheme,
      issuer,
      signature,
      data,
      uri
    } = fetchedClaim_2)
    assert.equal(Number(topic), attestation_2.topic)
    assert.equal(Number(scheme), attestation_2.scheme)
    assert.equal(issuer, attestation_2.issuer)
    assert.equal(signature, attestation_2.signature)
    assert.equal(data, attestation_2.data)
    assert.equal(uri, attestation_2.uri)

    // Check user registry
    const identityAddress = await userRegistry.methods.users(accounts[0]).call()
    assert.ok(identityAddress)
    assert.notEqual(
      identityAddress,
      '0x0000000000000000000000000000000000000000'
    )
  })
})
