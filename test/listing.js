const Listing = artifacts.require('./Listing.sol');

contract('Listing', ([owner]) => {
  let listing

  beforeEach('setup contract for each test', async () => {
    listing = await Listing.new(owner)
  })

  it('has an owner', async () => {
    assert.equal(await listing.owner(), owner)
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
    await listing.create(
      "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9", 0.6, 1
    )
    await listing.listingsLength()
      .then((listings) => {
        assert.equal(listings.toNumber(), 6);
      })
  })


  //it('can buy a listing', async function() {

  //})
})
