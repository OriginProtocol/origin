export const IpfsHash = '0x12345678901234567890123456789012'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default function({
  web3,
  Marketplace,
  Buyer,
  Seller,
  Affiliate,
  OriginToken,
  MarketArbitrator,
  ArbitratorAddr,
  trackGas
}) {
  async function createListing({ Identity }) {
    if (Identity) {
      await OriginToken.methods
        .transfer(Identity._address, 10)
        .send({ from: Seller })

      const approveAbi = await OriginToken.methods
        .approve(Marketplace._address, 10)
        .encodeABI()

      await Identity.methods
        .execute(OriginToken._address, 0, approveAbi)
        .send({ from: Seller })

      const createListingAbi = await Marketplace.methods
        .createListing(IpfsHash, 5, Seller)
        .encodeABI()

      return await Identity.methods
        .execute(Marketplace._address, 0, createListingAbi)
        .send({ from: Seller })
    } else {
      await OriginToken.methods
        .approve(Marketplace._address, 5)
        .send({ from: Seller })

      return await Marketplace.methods
        .createListing(IpfsHash, 5, Seller)
        .send({ from: Seller })
        .once('receipt', trackGas('Create Listing'))

      // return await OriginToken.methods
      //   .approveAndCall(Marketplace._address, 50, listingAbi)
      //   .send({ from: Seller })
    }
  }

  async function makeOffer({
    withdraw,
    listingID = 0,
    affiliate = Affiliate,
    commission = 2
  }) {
    const blockNumber = await web3.eth.getBlockNumber()
    const block = await web3.eth.getBlock(blockNumber)
    const value = web3.utils.toWei('0.1', 'ether')

    const args = [
      listingID,
      IpfsHash,
      block.timestamp + 60 * 120,
      affiliate,
      commission,
      value,
      '0x0000000000000000000000000000000000000000',
      ArbitratorAddr
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

  async function listingWithAcceptedOffer() {
    const listing = await createListing({})
    const listingID = listing.events.ListingCreated.returnValues.listingID
    const offer = await makeOffer({ listingID })
    const offerID = offer.events.OfferCreated.returnValues.offerID
    await acceptOffer({ listingID, offerID })
    return { listingID, offerID }
  }

  async function disputedOffer({ party = Buyer }) {
    const { listingID, offerID } = await listingWithAcceptedOffer()

    await Marketplace.methods
      .dispute(listingID, offerID, IpfsHash)
      .send({ from: Buyer })
      .once('receipt', trackGas('Dispute Offer'))

    const eth = await web3.eth.getBalance(party)
    const ogn = await OriginToken.methods.balanceOf(Affiliate).call()

    return {
      listingID,
      offerID,
      balance: {
        eth: new web3.utils.BN(eth),
        ogn: new web3.utils.BN(ogn)
      }
    }
  }

  async function acceptOffer({ listingID, offerID }) {
    return await Marketplace.methods
      .acceptOffer(listingID, offerID, IpfsHash)
      .send({ from: Seller })
      .once('receipt', trackGas('Accept Offer'))
  }

  async function giveRuling({
    listingID,
    offerID,
    ruling,
    refund = 0,
    party = Buyer
  }) {
    await Marketplace.methods
      .executeRuling(listingID, offerID, IpfsHash, ruling, refund)
      .send({ from: ArbitratorAddr })

    const eth = await web3.eth.getBalance(party)
    const ogn = await OriginToken.methods.balanceOf(Affiliate).call()

    return {
      balance: { eth: new web3.utils.BN(eth), ogn: new web3.utils.BN(ogn) }
    }
  }

  async function makeERC20Offer({
    Token,
    withdraw,
    listingID = 0,
    affiliate = Affiliate
  }) {
    const blockNumber = await web3.eth.getBlockNumber()
    const block = await web3.eth.getBlock(blockNumber)

    const args = [
      listingID,
      IpfsHash,
      block.timestamp + 60 * 120,
      affiliate,
      2,
      10,
      Token._address,
      MarketArbitrator._address
    ]
    if (withdraw !== undefined) {
      args.push(withdraw)
    }

    await Token.methods.approve(Marketplace._address, 100).send({ from: Buyer })

    return await Marketplace.methods
      .makeOffer(...args)
      .send({ from: Buyer })
      .once('receipt', trackGas('Make Offer ERC20'))
  }

  async function getBalance(party) {
    const eth = await web3.eth.getBalance(party)
    const ogn = await OriginToken.methods.balanceOf(party).call()

    return {
      eth: new web3.utils.BN(eth),
      ogn: new web3.utils.BN(ogn)
    }
  }

  return {
    makeOffer,
    makeERC20Offer,
    createListing,
    listingWithAcceptedOffer,
    disputedOffer,
    giveRuling,
    getBalance
  }
}
