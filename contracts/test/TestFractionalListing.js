const FractionalListing = artifacts.require('./FractionalListing.sol')
const Purchase = artifacts.require('./Purchase.sol')

const ipfsHash_1 =
  '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const ipfsHash_2 =
  '0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a'

contract('FractionalListing', accounts => {
  const seller = accounts[0]
  const buyer = accounts[1]
  let listing

  beforeEach(async function() {
    listing = await FractionalListing.new(seller, ipfsHash_1, { from: seller })
  })

  describe('update', () => {
    it('should update the ipfs hash', async function() {
      const originalIpfsHash = await listing.ipfsHash()
      await listing.update(0, ipfsHash_2, { from: seller })
      const newIpfsHash = await listing.ipfsHash()
      assert.equal(originalIpfsHash, ipfsHash_1)
      assert.equal(newIpfsHash, ipfsHash_2)
    })
  })

  describe('currentVersion', () => {
    it('should reflect the current version of the contract (0-indexed)', async function() {
      const originalVersion = await listing.currentVersion()
      await listing.update(0, ipfsHash_2, { from: seller })
      const newVersion = await listing.currentVersion()
      assert.equal(originalVersion, 0)
      assert.equal(newVersion, 1)
    })
  })

  describe('data', () => {
    it('should return the data for the specified version', async function() {
      const [_timestamp, _ipfsHash] = await listing.data(0)
      assert.isAbove(_timestamp, 0)
      assert.equal(_ipfsHash, ipfsHash_1)
    })
  })

  describe('request', () => {
    it('should create a purchase', async function() {
      const tx = await listing.request({
        from: buyer,
        value: 6
      })
      const listingPurchasedEvent = tx.logs.find(
        e => e.event == 'ListingPurchased'
      )
      const purchaseContract = await Purchase.at(
        listingPurchasedEvent.args._purchaseContract
      )

      assert.equal(await purchaseContract.buyer(), buyer)
      assert.equal(await purchaseContract.listingVersion(), 0)
      assert.equal((await listing.purchasesLength()).toNumber(), 1)
      assert.equal(await listing.getPurchase(0), purchaseContract.address)
    })
  })
})
