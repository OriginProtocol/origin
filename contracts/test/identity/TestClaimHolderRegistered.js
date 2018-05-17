var Web3 = require("web3")

const ClaimHolderRegistered = artifacts.require("ClaimHolderRegistered")
const UserRegistry = artifacts.require("UserRegistry")

const signature_1 = "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c"
const signature_2 = "0x061ef9cdd7707d90d7a7d95b53ddbd94905cb05dfe4734f97744c7976f2776145fef298fd0e31afa43a103cd7f5b00e3b226b0d62e4c492d54bec02eb0c2a0901b"

const dataHash_1 = "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9"
const dataHash_2 = "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48"

contract("ClaimHolderRegistered", accounts => {
  let claimHolderRegistered, userRegistry
  let attestation_1 = {
    claimType: 1,
    scheme: 1,
    issuer: accounts[1],
    signature: signature_1,
    data: dataHash_1,
    uri: ""
  }
  let attestation_2 = {
      claimType: 2,
      scheme: 1,
      issuer: accounts[2],
      signature: signature_2,
      data: dataHash_2,
      uri: ""
  }

  beforeEach(async function() {
    userRegistry = await UserRegistry.deployed()
    claimHolderRegistered = await ClaimHolderRegistered.new(userRegistry.address, { from: accounts[0] })
  })

  it("can add and get claim", async function() {
    let claimId = Web3.utils.soliditySha3(
      attestation_1.issuer,
      attestation_1.claimType
    )
    await claimHolderRegistered.addClaim(
      attestation_1.claimType,
      attestation_1.scheme,
      attestation_1.issuer,
      attestation_1.signature,
      attestation_1.data,
      attestation_1.uri,
      { from: accounts[0] }
    )
    let fetchedClaim = await claimHolderRegistered.getClaim(claimId, { from: accounts[0] })
    assert.ok(fetchedClaim)
    let [ claimType, scheme, issuer, signature, data, uri ] = fetchedClaim
    assert.equal(claimType.toNumber(), attestation_1.claimType)
    assert.equal(scheme.toNumber(), attestation_1.scheme)
    assert.equal(issuer, attestation_1.issuer)
    assert.equal(signature, attestation_1.signature)
    assert.equal(data, attestation_1.data)
    assert.equal(uri, attestation_1.uri)
  })

  it("can batch add claims", async function() {
    await claimHolderRegistered.addClaims(
      [ attestation_1.claimType, attestation_2.claimType ],
      [ attestation_1.issuer, attestation_2.issuer ],
      attestation_1.signature + attestation_2.signature.slice(2),
      attestation_1.data + attestation_2.data.slice(2),
      [32, 32],
      { from: accounts[0] }
    )

    let claimId_1 = Web3.utils.soliditySha3(
      attestation_1.issuer,
      attestation_1.claimType
    )
    let fetchedClaim_1 = await claimHolderRegistered.getClaim(claimId_1, { from: accounts[0] })
    assert.ok(fetchedClaim_1)
    let [ claimType_1, scheme_1, issuer_1, signature_1, data_1, uri_1 ] = fetchedClaim_1
    assert.equal(claimType_1.toNumber(), attestation_1.claimType)
    assert.equal(scheme_1.toNumber(), attestation_1.scheme)
    assert.equal(issuer_1, attestation_1.issuer)
    assert.equal(signature_1, attestation_1.signature)
    assert.equal(data_1, attestation_1.data)
    assert.equal(uri_1, attestation_1.uri)

    let claimId_2 = Web3.utils.soliditySha3(
      attestation_2.issuer,
      attestation_2.claimType
    )
    let fetchedClaim_2 = await claimHolderRegistered.getClaim(claimId_2, { from: accounts[0] })
    assert.ok(fetchedClaim_2)
    let [ claimType_2, scheme_2, issuer_2, signature_2, data_2, uri_2 ] = fetchedClaim_2
    assert.equal(claimType_2.toNumber(), attestation_2.claimType)
    assert.equal(scheme_2.toNumber(), attestation_2.scheme)
    assert.equal(issuer_2, attestation_2.issuer)
    assert.equal(signature_2, attestation_2.signature)
    assert.equal(data_2, attestation_2.data)
    assert.equal(uri_2, attestation_2.uri)
  })

  it("registers the user", async function() {
    let identityAddress = await userRegistry.users(accounts[0])
    assert.ok(identityAddress)
    assert.notEqual(identityAddress, "0x0000000000000000000000000000000000000000")
  })
})
