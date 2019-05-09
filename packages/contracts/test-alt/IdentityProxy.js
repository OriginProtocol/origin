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
    DaiStableCoin

  before(async function() {
    ({ web3, deploy, accounts } = await helper(`${__dirname}/..`))

    // Address that pays for new user
    Forwarder = accounts[0]
    Seller = accounts[1]

    // A dummy user address with zero ether
    NewUserAccount = web3.eth.accounts.create()

    Marketplace = await deploy('V00_Marketplace', {
      from: accounts[0],
      path: `${contractPath}/marketplace/v00`,
      file: 'Marketplace.sol',
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

  async function deployNewProxyContract() {
    const changeOwner = await IdentityProxyImp.methods
      .changeOwner(NewUserAccount.address)
      .encodeABI()

    const res = await ProxyFactory.methods
      .createProxyWithNonce(IdentityProxyImp._address, changeOwner, 0)
      .send({ from: Forwarder, gas: 4000000 })
      .once('receipt', trackGas('Deploy Proxy'))

    // const salt = web3.utils.soliditySha3(web3.utils.sha3(changeOwner), 0)
    //
    // let creationCode = await ProxyFactory.methods.proxyCreationCode().call()
    // creationCode += web3.eth.abi
    //   .encodeParameter('uint256', IdentityProxyImp._address)
    //   .slice(2)
    // const creationHash = web3.utils.sha3(creationCode)
    //
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
      const sign = web3.eth.accounts.sign(dataToSign, NewUserAccount.privateKey)

      const IdentityProxy = await deployNewProxyContract(NewUserAccount.address)

      const owner = await IdentityProxy.methods.owner().call()
      console.log('Account', NewUserAccount.address)
      console.log('Owner  ', owner)

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
      // console.log(Seller, Marketplace._address, Ipfs)
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

      const SellerProxy = SellerProxyRes.events.ProxyCreation.returnValues.proxy

      const listing2 = await Marketplace.methods.listings(1).call()
      console.log(Seller, listing2)

      const allowance = await DaiStableCoin.methods
        .allowance(SellerProxy, Marketplace._address)
        .call()
      console.log('allowance', allowance)
      // assert.equal(await Marketplace.methods.totalListings().call(), 2)
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
