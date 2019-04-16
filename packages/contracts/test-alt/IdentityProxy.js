import assert from 'assert'
import helper, { contractPath } from './_helper'
import { ZERO_ADDRESS, IpfsHash } from './_marketplaceHelpers'
import Table from 'cli-table'
import GasPriceInDollars from './_gasPriceInDollars'

const gasPriceInDollars = GasPriceInDollars({
  gasPriceGwei: 8,
  pricePerEth: 170
})
const gasUsed = []
const trackGas = id => receipt => gasUsed.push([id, receipt.cumulativeGasUsed])

describe('Identity', async function() {
  let web3, accounts, deploy
  let Marketplace, Forwarder, NewUserAccount, IdentityProxy, ProxyFactory

  before(async function() {
    ({ web3, deploy, accounts } = await helper(`${__dirname}/..`))

    // Address that pays for new user
    Forwarder = accounts[0]

    // A dummy user address with zero ether
    NewUserAccount = web3.eth.accounts.create()

    Marketplace = await deploy('V00_Marketplace', {
      from: accounts[0],
      path: `${contractPath}/marketplace/v00`,
      file: 'Marketplace.sol',
      args: [ZERO_ADDRESS]
    })

    ProxyFactory = await deploy('ProxyFactory', {
      from: accounts[0],
      path: `${contractPath}/identity`,
      file: 'ProxyFactory.sol'
    })
    // console.log('Proxy Factory at', ProxyFactory._address)
  })

  async function deployNewProxyContract() {
    const IdentityProxyImp = await deploy('IdentityProxy', {
      from: Forwarder,
      path: `${contractPath}/identity`,
      file: 'IdentityProxy.sol',
      args: [Forwarder],
      trackGas
    })

    const abi = await IdentityProxyImp.deploy({
      data: IdentityProxyImp.options.bytecode,
      arguments: [NewUserAccount.address]
    }).encodeABI()

    // console.log('Try change to', NewUserAccount.address)
    // console.log(
    //   'Proxy imp owner',
    //   await IdentityProxyImp.methods.owner().call()
    // )
    // console.log('Forwarder', Forwarder)

    const res = await ProxyFactory.methods
      .createProxy(
        IdentityProxyImp.options.address,
        abi
      )
      .send({ from: Forwarder, gas: 4000000 })
      .once('receipt', trackGas('Create Proxy from Factory'))

    IdentityProxy = new web3.eth.Contract(
      IdentityProxyImp.options.jsonInterface,
      res.events.ProxyDeployed.returnValues.targetAddress
    )

    // console.log('Old owner', await IdentityProxy.methods.owner().call())

    await IdentityProxy.methods.changeOwner(NewUserAccount.address).send({
      from: Forwarder,
      gas: 4000000
    })

    // console.log('New owner', await IdentityProxy.methods.owner().call())
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

      await deployNewProxyContract(NewUserAccount.address)
      // console.log(await IdentityProxy.methods.owner().call())

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
