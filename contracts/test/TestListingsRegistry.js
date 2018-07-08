const ListingsRegistryStorage = artifacts.require(
  './ListingsRegistryStorage.sol'
)
const contractDefinition = artifacts.require('./ListingsRegistry.sol')
const UnitListing = artifacts.require('./UnitListing.sol')

const initialListingsLength = 0
const ipfsHash =
  '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'

contract('ListingsRegistry', accounts => {
  const owner = accounts[0]
  let instance
  let listingsRegistryStorage

  beforeEach(async function() {
    listingsRegistryStorage = await ListingsRegistryStorage.new({ from: owner })
    instance = await contractDefinition.new(listingsRegistryStorage.address, {
      from: owner
    })
    listingsRegistryStorage.setActiveRegistry(instance.address)
  })

  it('should have owner as owner of contract', async function() {
    const contractOwner = await instance.owner()
    assert.equal(contractOwner, owner)
  })

  it('should be able to create a listing', async function() {
    const initPrice = 2
    const initUnitsAvailable = 5
    await instance.create(ipfsHash, initPrice, initUnitsAvailable, {
      from: accounts[0]
    })
    const listingCount = await instance.listingsLength()
    assert.equal(
      listingCount,
      initialListingsLength + 1,
      'listings count has incremented'
    )
    const listingAddress = await instance.getListingAddress(
      initialListingsLength
    )
    const [lister, hash, price, unitsAvailable] = await UnitListing.at(
      listingAddress
    ).data()
    assert.equal(lister, accounts[0], 'lister is correct')
    assert.equal(hash, ipfsHash, 'ipfsHash is correct')
    assert.equal(price, initPrice, 'price is correct')
    assert.equal(
      unitsAvailable,
      initUnitsAvailable,
      'unitsAvailable is correct'
    )
  })

  it('should be able to create a listing on behalf of other', async function() {
    const initPrice = 2
    const initUnitsAvailable = 5
    await instance.createOnBehalf(
      ipfsHash,
      initPrice,
      initUnitsAvailable,
      accounts[1],
      { from: accounts[0] }
    )
    const listingCount = await instance.listingsLength()
    assert.equal(
      listingCount,
      initialListingsLength + 1,
      'listings count has incremented'
    )
    const listingAddress = await instance.getListingAddress(
      initialListingsLength
    )
    const [lister, hash, price, unitsAvailable] = await UnitListing.at(
      listingAddress
    ).data()
    assert.equal(lister, accounts[1], 'lister is correct as other account')
    assert.equal(hash, ipfsHash, 'ipfsHash is correct')
    assert.equal(price, initPrice, 'price is correct')
    assert.equal(
      unitsAvailable,
      initUnitsAvailable,
      'unitsAvailable is correct'
    )
  })

  describe('Trusted listing check', async function() {
    it('should verify a trusted listing', async function() {
      await instance.create(ipfsHash, 3000, 1, { from: owner })
      const listingIndex = (await instance.listingsLength()) - 1
      const trustedListingAddress = await instance.getListingAddress(
        listingIndex
      )
      const isVerified = await instance.isTrustedListing(trustedListingAddress)
      expect(isVerified).to.equal(true)
    })
    it('should not verify an untrusted listing', async function() {
      const otherStorage = await ListingsRegistryStorage.new()
      const otherRegistry = await contractDefinition.new(otherStorage.address)
      await otherStorage.setActiveRegistry(otherRegistry.address)
      await otherRegistry.create(ipfsHash, 3000, 1)
      const listingIndex = (await otherRegistry.listingsLength()) - 1
      const otherListingAddress = await otherRegistry.getListingAddress(
        listingIndex
      )
      const isVerified = await instance.isTrustedListing(otherListingAddress)
      expect(isVerified).to.equal(false)
    })
  })
})
