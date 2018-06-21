const FractionalListing = artifacts.require('./FractionalListing.sol')

const ipfsHash_1 =
  '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const ipfsHash_2 =
  '0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a'

contract('FractionalListing', accounts => {
  const seller = accounts[0]
  let listing

  beforeEach(async function() {
    listing = await FractionalListing.new(seller, ipfsHash_1, { from: seller })
  })

  describe('updateIpfs', () => {
    it('should update the ipfs hash', async function() {
      const originalIpfsHash = await listing.ipfsHash()
      await listing.updateIpfsHash(ipfsHash_1, ipfsHash_2, { from: seller })
      const newIpfsHash = await listing.ipfsHash()
      assert.equal(originalIpfsHash, ipfsHash_1)
      assert.equal(newIpfsHash, ipfsHash_2)
    })
  })
})
