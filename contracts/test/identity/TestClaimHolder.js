const web3Utils = require('web3-utils')

const contractDefinition = artifacts.require("ClaimHolder")

const signature_1 = "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c"

const dataHash_1 = "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9"

contract("ClaimHolder", accounts => {
  let instance
  let attestation_1 = {
    claimType: 1,
    scheme: 11,
    issuer: accounts[1],
    signature: signature_1,
    data: dataHash_1,
    uri: "https://foo.bar/attestation1"
  }

  beforeEach(async function() {
    instance = await contractDefinition.new({ from: accounts[0] })
  })

  it("can add and get claim", async function() {
    let claimId = web3Utils.soliditySha3(
      attestation_1.issuer,
      attestation_1.claimType
    )
    await instance.addClaim(
      attestation_1.claimType,
      attestation_1.scheme,
      attestation_1.issuer,
      attestation_1.signature,
      attestation_1.data,
      attestation_1.uri,
      { from: accounts[0] }
    )
    let fetchedClaim = await instance.getClaim(claimId, { from: accounts[0] })
    assert.ok(fetchedClaim)
    let [ claimType, scheme, issuer, signature, data, uri ] = fetchedClaim
    assert.equal(claimType.toNumber(), attestation_1.claimType)
    assert.equal(scheme.toNumber(), attestation_1.scheme)
    assert.equal(issuer, attestation_1.issuer)
    assert.equal(signature, attestation_1.signature)
    assert.equal(data, attestation_1.data)
    assert.equal(uri, attestation_1.uri)
  })
})
