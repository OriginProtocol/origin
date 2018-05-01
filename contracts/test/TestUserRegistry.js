const web3Utils = require("web3-utils")

const UserRegistry = artifacts.require("./UserRegistry.sol")
const ClaimHolderPresigned = artifacts.require(
  "./dentity/ClaimHolderPresigned.sol"
)

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const signature_1 =
  "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c"

const ipfsHash_1 =
  "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9"

contract("UserRegistry", accounts => {
  let userRegistry
  let attestation_1 = {
    claimType: 1,
    scheme: 1,
    issuer: accounts[1],
    signature: signature_1,
    data: ipfsHash_1,
    uri: ""
  }

  beforeEach(async () => {
    userRegistry = await UserRegistry.new({ from: accounts[0] })
  })

  it("should be able to create a user", async function() {
    let create = await userRegistry.createUser({ from: accounts[1] })
    let identityAddress = await userRegistry.users(accounts[1])
    let newUserEvent = create.logs.find(e => e.event == "NewUser")
    assert.ok(identityAddress)
    assert.notEqual(
      identityAddress,
      "0x0000000000000000000000000000000000000000"
    )
    assert.equal(newUserEvent.args["_identity"], identityAddress)
  })

  it("should be able to create a user with claims", async function() {
    let createWithClaims = await userRegistry.createUserWithClaims(
      [attestation_1.claimType],
      [attestation_1.issuer],
      attestation_1.signature,
      attestation_1.data,
      [32],
      { from: accounts[1] }
    )
    let identityAddress = await userRegistry.users(accounts[1])
    let newUserEvent = createWithClaims.logs.find(e => e.event == "NewUser")
    assert.ok(identityAddress)
    assert.equal(newUserEvent.args["_identity"], identityAddress)

    // Check that claim was added
    let identity = ClaimHolderPresigned.at(identityAddress)
    let claimId = web3Utils.soliditySha3(
      attestation_1.issuer,
      attestation_1.claimType
    )
    let fetchedClaim = await identity.getClaim(claimId, { from: accounts[1] })
    assert.ok(fetchedClaim)
    let [claimType, scheme, issuer, signature, data, uri] = fetchedClaim
    assert.equal(claimType.toNumber(), attestation_1.claimType)
    assert.equal(scheme.toNumber(), attestation_1.scheme)
    assert.equal(issuer, attestation_1.issuer)
    assert.equal(signature, attestation_1.signature)
    assert.equal(data, attestation_1.data)
    assert.equal(uri, attestation_1.uri)
  })
})
