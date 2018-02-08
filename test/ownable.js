//to run this test run '$ ganache-cli' in another tab and then run '$ truffle test test/ownable.js'
//if you are having issues with async await then update your local node.js version
const Ownable = artifacts.require('./Ownable.sol');

contract('Ownable', ([owner]) => {
  let ownable
  let accounts

  beforeEach('setup contract for each test', async () => {
    ownable = await Ownable.new(owner)
    accounts = await web3.eth.accounts
  })

  it('has an owner', async () => {
    assert.equal(await ownable.owner(), owner)
    assert.equal(await ownable.owner(), accounts[0])
  })

  it('can transfer ownership from owners account', async () => {
    let bob = accounts[0]
    let alice = accounts[1]

    //owner is bob
    assert.equal(await ownable.owner(), bob)
    await ownable.transferOwnership(alice)
    //owner is alice
    assert.equal(await ownable.owner(), alice)
  })

  it('throws error if ownership is changed by non-owner account', async () => {
    let bob = accounts[0]
    let alice = accounts[1]
    let eve = accounts[2]

    //confirm the owner is bob
    assert.equal(await ownable.owner(), bob)

    //try to change ownership to alice from eve's account
    try {
    await ownable.transferOwnership(alice, {from: eve})
    } catch (error) {
      err = error
    }
    //assert that an error is thrown
    assert.ok(err instanceof Error)
  })
})

