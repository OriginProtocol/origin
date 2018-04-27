const contractDefinition = artifacts.require("ClaimHolderPresigned")

const signature_1 = "0x061ef9cd061ef9cd"
const signature_2 = "0xeb6123e5eb6123e5"

const dataHash_1 = "0x4f32f7a74f32f7a7"
const dataHash_2 = "0xa183d4eba183d4eb"

const uri_1 = "https://foo.bar/attestation1"
const uri_2 = "https://foo.bar/attestation2"

contract("ClaimHolderPresigned", accounts => {
  let instance
  let attestations = [
    {
      claimType: 1,
      scheme: 11,
      issuer: accounts[1],
      signature: signature_1,
      data: dataHash_1,
      uri: uri_1
    },
    {
      claimType: 2,
      scheme: 12,
      issuer: accounts[2],
      signature: signature_2,
      data: dataHash_2,
      uri: uri_2
    }
  ]

  beforeEach(async function() {
    instance = await contractDefinition.new(
      [1, 2],
      [11, 12],
      [accounts[1], accounts[2]],
      signature_1 + signature_2.slice(2),
      dataHash_1 + dataHash_2.slice(2),
      uri_1 + uri_2,
      [8, 8], // number of *bytes* ("0x061ef9cd061ef9cd" is 8 bytes)
      [8, 8],
      [ uri_1.length, uri_2.length ],
      { from: accounts[0] }
    )
  })

  it("should deploy identity with attestations", async function() {
    assert.ok(instance)
  })
})
