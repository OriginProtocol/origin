//to run this test run '$ ganache-cli' in another tab and then run '$ truffle test test/migration.js'
//if you are having issues with async await then update your local node.js version
const Migration = artifacts.require('./Migrations.sol');

contract('Migration', ([owner]) => {
  let migration
  let accounts

  beforeEach('setup contract for each test', async () => {
    migration = await Migration.new(owner)
    accounts = await web3.eth.accounts
  })

  it('has an owner', async () => {
    assert.equal(await migration.owner(), owner)
    assert.equal(await migration.owner(), accounts[0])
  })

  it('has a last completed migration and defaults to zero', async () => {
    const last = await migration.lastCompletedMigration.call()
    assert.equal(last.toNumber(), 0)
  })

  it('can set the last completed migration', async () => {
    let completed = 1234
    await migration.setCompleted(completed)
    const last = await migration.lastCompletedMigration.call()
    assert.equal(last.toNumber(), 1234)
  })

  it('can upgrade the address to a new address', async () => {
    //works in remix but unable to write test without VM acception revert
    //I believe the issue is the required transaction value and/or the web3 version
  })
})

