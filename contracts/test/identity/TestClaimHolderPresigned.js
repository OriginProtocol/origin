const contractDefinition = artifacts.require("ClaimHolderPresigned")

const signature_1 = "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c"
const signature_2 = "0x061ef9cdd7707d90d7a7d95b53ddbd94905cb05dfe4734f97744c7976f2776145fef298fd0e31afa43a103cd7f5b00e3b226b0d62e4c492d54bec02eb0c2a0901b"

const dataHash_1 = "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9"
const dataHash_2 = "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48"

// number of bytes in a hex string:
// num characters (without "0x") divided by 2
const numBytesInSignature = 65
const numBytesInDataHash = 32

contract("ClaimHolderPresigned", accounts => {
  let attestation_1 = {
    claimType: 1,
    scheme: 11,
    issuer: accounts[1],
    signature: signature_1,
    data: dataHash_1,
    uri: "https://foo.bar/attestation1"
  }
  let attestation_2 = {
      claimType: 2,
      scheme: 12,
      issuer: accounts[2],
      signature: signature_2,
      data: dataHash_2,
      uri: "https://foo.bar/attestation2"
  }

  it("should deploy identity with attestations", async function() {
    let instance = await contractDefinition.new(
      [ attestation_1.claim_type, attestation_2.claim_type ],
      [ attestation_1.scheme, attestation_2.scheme ],
      [ attestation_1.issuer, attestation_2.issuer ],
      attestation_1.signature + attestation_2.signature.slice(2),
      attestation_1.data + attestation_2.data.slice(2),
      attestation_1.uri + attestation_2.uri,
      [ numBytesInSignature, numBytesInSignature ],
      [ numBytesInDataHash, numBytesInDataHash ],
      [ attestation_1.uri.length, attestation_2.uri.length ],
      { from: accounts[0] }
    )
    assert.ok(instance)
  })
})
