const assert = require('assert')
const Web3 = require('web3')
const { Validator, PROXY_HARDCODE } = require('../src/validator')

const { TEST_PROVIDER_URL, JUNK_HASH } = require('./const')

const web3 = new Web3(TEST_PROVIDER_URL)

const addresses = require('@origin/contracts/build/tests.json')

const IdentityProxyBuild = require('@origin/contracts/build/contracts/IdentityProxy_solc.json')
const Proxy = new web3.eth.Contract(IdentityProxyBuild.abi)
const IdentityEventsBuild = require('@origin/contracts/build/contracts/IdentityEvents.json')
const IdentityEvents = new web3.eth.Contract(IdentityEventsBuild.abi)
const V00MarketplaceBuild = require('@origin/contracts/build/contracts/V00_Marketplace.json')
const V00Marketplace = new web3.eth.Contract(V00MarketplaceBuild.abi)
const V01MarketplaceBuild = require('@origin/contracts/build/contracts/V01_Marketplace.json')
const V01Marketplace = new web3.eth.Contract(V01MarketplaceBuild.abi)
const UniswapDaiExchangeBuild = require('../src/contracts/UniswapExchange.json')
const UniswapDaiExchange = new web3.eth.Contract(UniswapDaiExchangeBuild.abi)

describe('relayer whitelist', async () => {
  const Alice = '0xA11c30C5Bf41A3068292221f207009De617520C7'
  const Bob = '0xb0bC19BAECeC052CF2a95450008158AaecEC445f'
  const Mallory = '0xBad88c0c39a28888a069261714d21528F7e2DF3F'

  const whitelist = new Validator(addresses)

  before(async () => {})

  describe('whitelist identity events methods', async () => {
    describe('identityUpdated', async () => {
      it('should succeed', async () => {
        const txdata = IdentityEvents.methods
          .emitIdentityUpdated(JUNK_HASH)
          .encodeABI()
        const res = whitelist.validate(addresses.IdentityEvents, txdata)
        assert(res)
      })
    })
    describe('identityDeleted', async () => {
      it('should succeed', async () => {
        const txdata = IdentityEvents.methods.emitIdentityDeleted().encodeABI()
        const res = whitelist.validate(addresses.IdentityEvents, txdata)
        assert(res)
      })
    })
    describe('non-identity function', async () => {
      it('should fail', async () => {
        const txdata = Proxy.methods.changeOwner(Bob).encodeABI()
        const res = whitelist.validate(addresses.IdentityEvents, txdata)
        assert(!res)
      })
    })
  })

  describe('whitelist marketplace 000 methods', async () => {
    describe('createListing', async () => {
      it('should succeed', async () => {
        const txdata = V00Marketplace.methods
          .createListing(JUNK_HASH, 0, Bob)
          .encodeABI()
        const res = whitelist.validate(addresses.Marketplace, txdata)
        assert(res)
      })
    })
    describe('updateListing', async () => {
      it('should succeed', async () => {
        const txdata = V00Marketplace.methods
          .updateListing(1, JUNK_HASH, 0)
          .encodeABI()
        const res = whitelist.validate(addresses.Marketplace, txdata)
        assert(res)
      })
    })
    describe('non-marketplace function', async () => {
      it('should fail', async () => {
        const txdata = Proxy.methods.changeOwner(Bob).encodeABI()
        const res = whitelist.validate(addresses.Marketplace, txdata)
        assert(!res)
      })
    })
  })

  describe('whitelist proxy marketplace calls', () => {
    describe('marketplaceExecute', async () => {
      const testMarketplaceExecute = opts => {
        const marketplaceTxdata = V00Marketplace.methods
          .updateListing(1, JUNK_HASH, 0)
          .encodeABI()
        const defaultOpts = {
          owner: Bob,
          marketplace: addresses.Marketplace,
          offer: marketplaceTxdata,
          token: addresses.OGN,
          value: 1000000
        }
        opts = Object.assign({}, defaultOpts, opts || {})

        const txdata = Proxy.methods
          .marketplaceExecute(
            opts.owner,
            opts.marketplace,
            opts.offer,
            opts.token,
            opts.value
          )
          .encodeABI()
        return whitelist.validate(PROXY_HARDCODE, txdata)
      }

      it('should succeed', async () => {
        assert(true === testMarketplaceExecute({}))
      })
      it('should fail if wrong marketplace', async () => {
        assert(
          false ===
            testMarketplaceExecute({
              marketplace: Mallory
            })
        )
      })
      it('should fail if wrong marketplace command', async () => {
        const marketplaceTxdata = Proxy.methods.changeOwner(Bob).encodeABI()
        assert(
          false ===
            testMarketplaceExecute({
              offer: marketplaceTxdata
            })
        )
      })
      it('should fail if wrong token address', async () => {
        assert(
          false ===
            testMarketplaceExecute({
              token: Mallory
            })
        )
      })
    })

    describe('transferTokenMarketplaceExecute', async () => {
      const testTransferTokenMarketplaceExecute = opts => {
        const marketplaceTxdata = V00Marketplace.methods
          .updateListing(1, JUNK_HASH, 0)
          .encodeABI()
        const defaultOpts = {
          owner: Bob,
          marketplace: addresses.Marketplace,
          offer: marketplaceTxdata,
          token: addresses.OGN,
          value: 1000000
        }
        opts = Object.assign({}, defaultOpts, opts || {})

        const txdata = Proxy.methods
          .transferTokenMarketplaceExecute(
            opts.owner,
            opts.marketplace,
            opts.offer,
            opts.token,
            opts.value
          )
          .encodeABI()
        return whitelist.validate(PROXY_HARDCODE, txdata)
      }
      it('should succeed', async () => {
        assert(testTransferTokenMarketplaceExecute({}))
      })
      it('should fail if wrong marketplace', async () => {
        assert(
          !testTransferTokenMarketplaceExecute({
            marketplace: Mallory
          })
        )
      })
      it('should fail if wrong marketplace command', async () => {
        const marketplaceTxdata = Proxy.methods.changeOwner(Bob).encodeABI()
        assert(
          !testTransferTokenMarketplaceExecute({
            offer: marketplaceTxdata
          })
        )
      })
      it('should fail if wrong token address', async () => {
        assert(
          !testTransferTokenMarketplaceExecute({
            token: Mallory
          })
        )
      })
    })

    describe('marketplaceFinalizeAndPay', async () => {
      const testMarketplaceFinalizeAndPay = opts => {
        const marketplaceTxdata = V00Marketplace.methods
          .updateListing(1, JUNK_HASH, 0)
          .encodeABI()
        const defaultOpts = {
          marketplace: addresses.Marketplace,
          finalize: marketplaceTxdata,
          seller: Alice,
          currency: addresses.OGN,
          value: 1000000
        }
        opts = Object.assign({}, defaultOpts, opts || {})

        const txdata = Proxy.methods
          .marketplaceFinalizeAndPay(
            opts.marketplace,
            opts.finalize,
            opts.seller,
            opts.currency,
            opts.value
          )
          .encodeABI()
        return whitelist.validate(PROXY_HARDCODE, txdata)
      }
      it('should succeed', async () => {
        assert(testMarketplaceFinalizeAndPay({}))
      })
      it('should succeed with no currency (use ETH)', async () => {
        assert(
          testMarketplaceFinalizeAndPay({
            currency: 0
          })
        )
      })
      it('should fail if wrong marketplace', async () => {
        assert(
          !testMarketplaceFinalizeAndPay({
            marketplace: Mallory
          })
        )
      })
      it('should fail if wrong marketplace command', async () => {
        const marketplaceTxdata = Proxy.methods.changeOwner(Bob).encodeABI()
        assert(
          !testMarketplaceFinalizeAndPay({
            finalize: marketplaceTxdata
          })
        )
      })
      it('should fail if wrong token address', async () => {
        assert(
          !testMarketplaceFinalizeAndPay({
            currency: Mallory
          })
        )
      })
    })

    describe('swapAndMakeOffer', async () => {
      const testSwapAndMakeOffer = opts => {
        const marketplaceTxdata = V00Marketplace.methods
          .updateListing(1, JUNK_HASH, 0)
          .encodeABI()
        const exchangeTxdata = UniswapDaiExchange.methods
          .ethToTokenSwapOutput(1, 1)
          .encodeABI()
        const defaultOpts = {
          owner: Bob,
          marketplace: addresses.Marketplace,
          offer: marketplaceTxdata,
          exchange: addresses.UniswapDaiExchange,
          swap: exchangeTxdata,
          token: addresses.DAI,
          value: 1000000
        }
        opts = Object.assign({}, defaultOpts, opts || {})

        const txdata = Proxy.methods
          .swapAndMakeOffer(
            opts.owner,
            opts.marketplace,
            opts.offer,
            opts.exchange,
            opts.swap,
            opts.token,
            opts.value
          )
          .encodeABI()
        return whitelist.validate(PROXY_HARDCODE, txdata)
      }
      it('should succeed', async () => {
        assert(testSwapAndMakeOffer({}))
      })
      it('should succeed if V01 marketplace', async () => {
        assert(
          testSwapAndMakeOffer({
            marketplace: addresses.Marketplace_V01
          })
        )
      })
      it('should fail if wrong marketplace', async () => {
        assert(
          !testSwapAndMakeOffer({
            marketplace: Mallory
          })
        )
      })
      it('should fail if wrong marketplace command', async () => {
        const marketplaceTxdata = Proxy.methods.changeOwner(Bob).encodeABI()
        assert(
          !testSwapAndMakeOffer({
            offer: marketplaceTxdata
          })
        )
      })
      it('should fail if wrong exchange', async () => {
        assert(
          !testSwapAndMakeOffer({
            exchange: Mallory
          })
        )
      })
      it('should fail if wrong exchange command', async () => {
        const exchangeTxdata = UniswapDaiExchange.methods
          .addLiquidity(1, 1, 1)
          .encodeABI()
        assert(
          !testSwapAndMakeOffer({
            swap: exchangeTxdata
          })
        )
      })
      it('should fail if wrong token address', async () => {
        assert(
          !testSwapAndMakeOffer({
            token: Mallory
          })
        )
      })
    })

    describe('another forward', async () => {
      it('should fail', async () => {
        const innerTxdata = Proxy.methods.changeOwner(Bob).encodeABI()
        const sig = '0x1234'
        const txdata = Proxy.methods
          .forward(Bob, sig, Bob, innerTxdata)
          .encodeABI()
        const res = whitelist.validate(PROXY_HARDCODE, txdata)
        assert(!res)
      })
    })
  })
})
