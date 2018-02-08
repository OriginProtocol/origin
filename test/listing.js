//to run this test run '$ ganache-cli' in another tab and then run '$ truffle test test/listing.js'
//if you are having issues with async await then update your local node.js version

const Listing = artifacts.require('./Listing.sol');

contract('Listing', ([owner]) => {
  let listing
  let accounts

  beforeEach('setup contract for each test', async () => {
    listing = await Listing.new(owner)
    accounts = await web3.eth.accounts
  })

  it('has an owner', async () => {
    assert.equal(await listing.owner(), owner)
    assert.equal(await listing.owner(), accounts[0])
  })

  it('can return a listing', async () => {
    await listing.getListing.call(4)
      .then((listing)  => {
        const listingObject = {
          index: listing[0].toNumber(),
          lister: listing[1],
          ipfsHash: listing[2],
          price: web3.fromWei(listing[3], 'ether').toNumber(),
          unitsAvailable: listing[4].toNumber(),
          timeCreated: listing[5].toNumber()
        }
        assert.ok(listingObject)
      })
  })

  it('can return total listings', async () => {
    await listing.listingsLength()
      .then((listings) => {
        assert.equal(listings.toNumber(), 5);
      })
  })

  it('can create a listing', async () => {

    await listing.listingsLength()
      .then((listings) => {
        assert.equal(listings.toNumber(), 5);
      })

    await listing.create(
      "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9", 0.6, 1
    )
    await listing.listingsLength()
      .then((listings) => {
        assert.equal(listings.toNumber(), 6);
      })
  })

  it('can buy a listing', async () => {
    //create listing of ten units
    await listing.create(
      "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9", 0.1, 10
    )

    //verify there are ten units
    await listing.getListing.call(5)
      .then((listing)  => {
        assert.equal(listing[4].toNumber(), 10)
        })

    //buy five units
    await listing.buyListing(5, 5)

    //check new listing total
    await listing.getListing.call(5)
      .then((listing)  => {
        assert.equal(listing[4].toNumber(), 5)
        })
  })
})
