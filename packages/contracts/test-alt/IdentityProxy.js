import assert from 'assert'
import helper, { contractPath } from './_helper'
import { ZERO_ADDRESS, IpfsHash } from './_marketplaceHelpers'
import Table from 'cli-table'
import GasPriceInDollars from './_gasPriceInDollars'

const gasPriceInDollars = GasPriceInDollars({
  gasPriceGwei: 4,
  pricePerEth: 170
})
const gasUsed = []
const trackGas = id => receipt => gasUsed.push([id, receipt.cumulativeGasUsed])

describe('Identity', async function() {
  let web3, accounts, deploy
  let Marketplace,
    Forwarder,
    NewUserAccount,
    ProxyFactory,
    IdentityProxyImp,
    Seller,
    DaiStableCoin,
    decodeEvent

  async function makeOffer({ listingID, value }) {
    const blockNumber = await web3.eth.getBlockNumber()
    const block = await web3.eth.getBlock(blockNumber)

    const args = [
      listingID,
      IpfsHash,
      block.timestamp + 60 * 120,
      ZERO_ADDRESS, // affiliate
      '0', // commission
      value, // value
      ZERO_ADDRESS,
      accounts[0] // arbitrator
    ]
    return await Marketplace.methods.makeOffer(...args).encodeABI()
  }

  before(async function() {
    ({ web3, deploy, accounts, decodeEvent } = await helper(`${__dirname}/..`))

    // Address that pays for new user
    Forwarder = accounts[0]
    Seller = accounts[1]

    // A dummy user address with zero ether
    NewUserAccount = web3.eth.accounts.create()

    Marketplace = await deploy('V00_Marketplace', {
      from: accounts[0],
      path: `${contractPath}/marketplace`,
      file: 'V00_Marketplace.sol',
      args: [ZERO_ADDRESS]
    })

    DaiStableCoin = await deploy('Token', {
      from: accounts[0],
      path: `${__dirname}/contracts/`,
      args: ['Dai', 'DAI', 2, 12000]
      // args: [12000]
    })

    ProxyFactory = await deploy('ProxyFactory', {
      from: accounts[0],
      path: `${contractPath}/proxy`,
      file: 'ProxyFactory.s'
    })

    IdentityProxyImp = await deploy('IdentityProxy', {
      from: Forwarder,
      path: `${contractPath}/identity`,
      file: 'IdentityProxy.s',
      args: [Forwarder]
    })
  })

  async function deployNewProxyContract(owner) {
    const changeOwner = await IdentityProxyImp.methods
      .changeOwner(owner)
      .encodeABI()

    const res = await ProxyFactory.methods
      .createProxyWithSenderNonce(
        IdentityProxyImp._address,
        changeOwner,
        owner,
        0
      )
      .send({ from: Forwarder, gas: 4000000 })
      .once('receipt', trackGas('Deploy Proxy'))

    // const salt = web3.utils.soliditySha3(web3.utils.sha3(changeOwner), 0)
    // const salt = web3.utils.soliditySha3(owner, 0)

    // let creationCode = await ProxyFactory.methods.proxyCreationCode().call()
    // creationCode += web3.eth.abi
    //   .encodeParameter('uint256', IdentityProxyImp._address)
    //   .slice(2)

    // const creationHash = web3.utils.sha3(creationCode)

    // const create2hash = web3.utils
    //   .soliditySha3('0xff', ProxyFactory._address, salt, creationHash)
    //   .slice(-40)
    // const predicted = `0x${create2hash}`

    // console.log('predicted', predicted)
    // console.log('actual   ', res.events.ProxyCreation.returnValues.proxy)

    return new web3.eth.Contract(
      IdentityProxyImp.options.jsonInterface,
      res.events.ProxyCreation.returnValues.proxy
    )
  }

  describe('IdentityProxy.sol', function() {
    describe('transferToOwner with Eth', function() {
      let Wallet, IdentityProxy
      before(async function() {
        web3.eth.accounts.wallet.create(1)
        Wallet = web3.eth.accounts.wallet[web3.eth.accounts.wallet.length - 1]
        await web3.eth.sendTransaction({
          from: Forwarder,
          to: Wallet.address,
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 100000
        })
        IdentityProxy = await deployNewProxyContract(Wallet.address)
        await web3.eth.sendTransaction({
          from: Forwarder,
          to: IdentityProxy._address,
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 100000
        })
      })

      it('should have the correct owner', async function() {
        const owner = await IdentityProxy.methods.owner().call()
        assert(owner === Wallet.address)
      })

      it('should allow transfer of Eth by owner', async function() {
        const balanceBefore = await web3.eth.getBalance(Wallet.address)
        await IdentityProxy.methods
          .transferToOwner(0x00, web3.utils.toWei('0.01', 'ether'))
          .send({ from: Wallet.address, gas: 100000 })
        const balanceAfter = await web3.eth.getBalance(Wallet.address)
        assert(balanceAfter !== balanceBefore)
      })

      it('should allow transfer of Eth by non-owner', async function() {
        const balanceBefore = await web3.eth.getBalance(Wallet.address)
        await IdentityProxy.methods
          .transferToOwner(0x00, web3.utils.toWei('0.01', 'ether'))
          .send({ from: Forwarder, gas: 100000 })
        const balanceAfter = await web3.eth.getBalance(Wallet.address)
        assert(balanceAfter !== balanceBefore)
      })

      it('should allow transfer by non-owner to be enabled', async function() {
        const transferToOwner = web3.utils.fromAscii('transferToOwner')
        await IdentityProxy.methods
          .setData(
            web3.utils.padLeft(transferToOwner, 64),
            web3.utils.padLeft(web3.utils.fromAscii('disable'), 64)
          )
          .send({ from: Wallet.address, gas: 100000 })
      })

      it('should throw when transfer of Eth is attempted by non-owner', async function() {
        const res = await new Promise((resolve, reject) => {
          IdentityProxy.methods
            .transferToOwner(0x00, web3.utils.toWei('0.01', 'ether'))
            .send({ from: Forwarder, gas: 100000 })
            .catch(resolve)
            .then(reject)
        })
        assert(res.toString().indexOf('revert') > 0)
      })
    })

    describe('transferToOwner with Dai', function() {
      let Wallet, IdentityProxy
      before(async function() {
        web3.eth.accounts.wallet.create(1)
        Wallet = web3.eth.accounts.wallet[web3.eth.accounts.wallet.length - 1]
        await web3.eth.sendTransaction({
          from: Forwarder,
          to: Wallet.address,
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 100000
        })
        IdentityProxy = await deployNewProxyContract(Wallet.address)
        await DaiStableCoin.methods
          .transfer(IdentityProxy._address, '1000')
          .send({
            from: accounts[0],
            gas: 100000
          })
      })

      it('should have the correct owner', async function() {
        const owner = await IdentityProxy.methods.owner().call()
        assert(owner === Wallet.address)
      })

      it('should allow transfer of Dai by owner', async function() {
        const balanceBefore = await DaiStableCoin.methods.balanceOf(
          Wallet.address
        )
        await IdentityProxy.methods
          .transferToOwner(DaiStableCoin._address, '100')
          .send({ from: Wallet.address, gas: 100000 })
        const balanceAfter = await DaiStableCoin.methods.balanceOf(
          Wallet.address
        )
        assert(balanceAfter !== balanceBefore)
      })

      it('should allow transfer of Dai by non-owner', async function() {
        const balanceBefore = await DaiStableCoin.methods.balanceOf(
          Wallet.address
        )
        await IdentityProxy.methods
          .transferToOwner(DaiStableCoin._address, '100')
          .send({ from: Forwarder, gas: 100000 })
        const balanceAfter = await DaiStableCoin.methods.balanceOf(
          Wallet.address
        )
        assert(balanceAfter !== balanceBefore)
      })

      it('should allow transfer by non-owner to be disabled', async function() {
        const transferToOwner = web3.utils.fromAscii('transferToOwner')
        await IdentityProxy.methods
          .setData(
            web3.utils.padLeft(transferToOwner, 64),
            web3.utils.padLeft(web3.utils.fromAscii('disable'), 64)
          )
          .send({ from: Wallet.address, gas: 100000 })
      })

      it('should throw when transfer of Dai is attempted by non-owner', async function() {
        const res = await new Promise((resolve, reject) => {
          IdentityProxy.methods
            .transferToOwner(DaiStableCoin._address, '100')
            .send({ from: Forwarder, gas: 100000 })
            .catch(resolve)
            .then(reject)
        })
        assert(res.toString().indexOf('revert') > 0)
      })
    })

    describe('Marketplace interactions', function() {
      it('should forward createListing tx from user proxy', async function() {
        const txData = Marketplace.methods
          .createListing(IpfsHash, 0, Marketplace._address)
          .encodeABI()

        const dataToSign = web3.utils.soliditySha3(
          { t: 'address', v: NewUserAccount.address }, // Signer
          { t: 'address', v: Marketplace._address }, // Marketplace address
          { t: 'uint256', v: web3.utils.toWei('0', 'ether') }, // value
          { t: 'bytes', v: txData },
          { t: 'uint256', v: 0 } // nonce
        )

        const signer = NewUserAccount.address
        const sign = web3.eth.accounts.sign(
          dataToSign,
          NewUserAccount.privateKey
        )

        const IdentityProxy = await deployNewProxyContract(
          NewUserAccount.address
        )

        const owner = await IdentityProxy.methods.owner().call()
        // console.log('Account', NewUserAccount.address)
        // console.log('Owner  ', owner)

        assert(owner, NewUserAccount.address)

        const result = await IdentityProxy.methods
          .forward(Marketplace._address, sign.signature, signer, txData)
          .send({
            from: Forwarder,
            gas: 4000000
          })
          .once('receipt', trackGas('Create Listing w/ Proxy'))

        assert(result)

        const total = await Marketplace.methods.totalListings().call()
        assert.equal(total, 1)

        const listing = await Marketplace.methods.listings(0).call()
        assert.equal(listing.seller, IdentityProxy._address)

        const Ipfs = '0x12345678901234567890123456789012'
        const listingAbi = await Marketplace.methods
          .createListing(Ipfs, 0, Seller)
          .encodeABI()

        const execABI = await IdentityProxyImp.methods
          .marketplaceExecute(
            Seller,
            Marketplace._address,
            listingAbi,
            DaiStableCoin._address,
            100
          )
          .encodeABI()

        const SellerProxyRes = await ProxyFactory.methods
          .createProxy(IdentityProxyImp._address, execABI)
          .send({ from: Forwarder, gas: 4000000 })
          .once('receipt', trackGas('Deploy Proxy'))

        const SellerProxy =
          SellerProxyRes.events.ProxyCreation.returnValues.proxy

        const listing2 = await Marketplace.methods.listings(1).call()
        assert(listing2)

        const allowance = await DaiStableCoin.methods
          .allowance(SellerProxy, Marketplace._address)
          .call()

        assert(allowance === '100')
        assert.equal(await Marketplace.methods.totalListings().call(), 2)
      })

      it('should allow seller funds to be transferred automatically', async function() {
        const wallet = web3.eth.accounts.wallet

        wallet.create(1)
        const BuyerWallet = wallet[wallet.length - 1]
        await web3.eth.sendTransaction({
          from: Forwarder,
          to: BuyerWallet.address,
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 100000
        })

        const BuyerProxy = await deployNewProxyContract(BuyerWallet.address)

        wallet.create(1)
        const SellerWallet = wallet[wallet.length - 1]
        await web3.eth.sendTransaction({
          from: Forwarder,
          to: SellerWallet.address,
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 100000
        })
        const SellerProxy = await deployNewProxyContract(SellerWallet.address)

        const Ipfs = '0x12345678901234567890123456789012'
        const listingAbi = await Marketplace.methods
          .createListing(Ipfs, 0, SellerProxy._address)
          .encodeABI()
        const res = await SellerProxy.methods
          .execute(0, Marketplace._address, '0', listingAbi)
          .send({ from: SellerWallet.address, gas: 4000000 })

        const createListingEvent = decodeEvent(res.events['0'].raw, Marketplace)
        const listingID = createListingEvent.listingID

        const value = web3.utils.toWei('0.001', 'ether')
        const offerAbi = await makeOffer({ listingID, value })
        const offerRes = await BuyerProxy.methods
          .execute(0, Marketplace._address, value, offerAbi)
          .send({ from: BuyerWallet.address, gas: 4000000, value })

        const createOfferEvent = decodeEvent(
          offerRes.events['0'].raw,
          Marketplace
        )
        const offerID = createOfferEvent.offerID

        const acceptAbi = await Marketplace.methods
          .acceptOffer(listingID, offerID, IpfsHash)
          .encodeABI()

        await SellerProxy.methods
          .execute(0, Marketplace._address, '0', acceptAbi)
          .send({ from: SellerWallet.address, gas: 4000000 })

        const finalizeAbi = await Marketplace.methods
          .finalize(listingID, offerID, IpfsHash)
          .encodeABI()

        const balanceBefore = await web3.eth.getBalance(SellerWallet.address)

        const finalizePayAbi = await BuyerProxy.methods
          .marketplaceFinalizeAndPay(
            Marketplace._address,
            finalizeAbi,
            SellerProxy._address,
            ZERO_ADDRESS,
            value
          )
          .encodeABI()

        await BuyerProxy.methods
          .execute(0, BuyerProxy._address, '0', finalizePayAbi)
          .send({ from: BuyerWallet.address, gas: 4000000 })

        const balanceAfter = await web3.eth.getBalance(SellerWallet.address)

        assert(balanceBefore !== balanceAfter)
      })
    })
  })

  after(function() {
    console.log()

    const gasTable = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      colAligns: ['left', 'right', 'right'],
      head: ['Transaction', 'Min', 'Max', 'Min $', 'Max $']
    })

    const used = []
    gasUsed.forEach(g => {
      const existing = used.findIndex(u => u[0] === g[0])
      if (existing < 0) {
        used.push([g[0], g[1], g[1]])
      } else {
        if (g[1] < used[existing][1]) used[existing][1] = g[1]
        if (g[2] > used[existing][2]) used[existing][2] = g[2]
      }
    })

    used.forEach(u => {
      gasTable.push([...u, gasPriceInDollars(u[1]), gasPriceInDollars(u[2])])
    })
    console.log(gasTable.toString())
  })
})
