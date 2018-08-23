export const IpfsHash = '0x12345678901234567890123456789012'

export default function({
  web3,
  Marketplace,
  Buyer,
  Seller,
  OriginToken,
  MarketArbitrator,
  trackGas
}) {
  async function createListing({ Identity }) {
    if (Identity) {
      await OriginToken.methods
        .transfer(Identity._address, 100)
        .send({ from: Seller })

      const approveAbi = await OriginToken.methods
        .approve(Marketplace._address, 100)
        .encodeABI()

      await Identity.methods
        .execute(OriginToken._address, 0, approveAbi)
        .send({ from: Seller })

      const createListingAbi = await Marketplace.methods
        .createListing(IpfsHash, 50, Seller)
        .encodeABI()

      return await Identity.methods
        .execute(Marketplace._address, 0, createListingAbi)
        .send({ from: Seller })
    } else {
      await OriginToken.methods
        .approve(Marketplace._address, 50)
        .send({ from: Seller })

      return await Marketplace.methods
        .createListing(IpfsHash, 50, Seller)
        .send({ from: Seller })
        .once('receipt', trackGas('Create Listing'))

      // return await OriginToken.methods
      //   .approveAndCall(Marketplace._address, 50, listingAbi)
      //   .send({ from: Seller })
    }
  }

  async function makeOffer({ withdraw, listingID = 0 }) {
    const blockNumber = await web3.eth.getBlockNumber()
    const block = await web3.eth.getBlock(blockNumber)
    const value = web3.utils.toWei('0.1', 'ether')

    const args = [
      listingID,
      IpfsHash,
      block.timestamp + 60 * 120,
      Buyer,
      2,
      value,
      '0x0',
      MarketArbitrator._address
    ]
    if (withdraw !== undefined) {
      args.push(withdraw)
    }
    const result = await Marketplace.methods
      .makeOffer(...args)
      .send({ from: Buyer, value })
      .once('receipt', trackGas('Make Offer'))
    return result
  }

  async function makeERC20Offer({ Token, withdraw, listingID = 0 }) {
    const blockNumber = await web3.eth.getBlockNumber()
    const block = await web3.eth.getBlock(blockNumber)

    const args = [
      listingID,
      IpfsHash,
      block.timestamp + 60 * 120,
      Buyer,
      2,
      10,
      Token._address,
      MarketArbitrator._address
    ]
    if (withdraw !== undefined) {
      args.push(withdraw)
    }

    await Token.methods.approve(Marketplace._address, 100).send({ from: Buyer })

    return await Marketplace.methods.makeOffer(...args).send({ from: Buyer }).once('receipt', trackGas('Make Offer ERC20'))
  }

  return { makeOffer, makeERC20Offer, createListing }
}
