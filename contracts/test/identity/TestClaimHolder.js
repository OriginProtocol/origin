const contractDefinition = artifacts.require("ClaimHolder")

contract("ClaimHolder", accounts => {
  var instance

  beforeEach(async function() {
    instance = await contractDefinition.new({ from: accounts[0] })
  })

  it("should deploy identity", async function() {
    assert.ok(instance)
  })
})
