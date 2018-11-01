import assert from 'assert'

import helper, { contractPath } from './_helper'
import MarketplaceJson from '../build/contracts/V00_Marketplace'
import Marketplace from '../lib/marketplace'

// These tests are for the token library that the token CLI uses. We don't
// validate the effects of various operations. That is left to the contract
// tests.
describe('Marketplace CLI Library', async function() {
  const supply = 1000
  const networkId = '999'
  const testContractName = 'TestMarketplace'

  let accounts, deploy, web3
  let owner, nonOwner
  let OriginToken, MarketplaceContract
  let MarketplaceLib

  beforeEach(async function() {
    ({
      deploy,
      accounts,
      web3,
    } = await helper(`${__dirname}/..`))
    owner = accounts[0]
    nonOwner = accounts[1]
    OriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [supply]
    })
    MarketplaceContract = await deploy('V00_Marketplace', {
      from: owner,
      // path: `${__dirname}/contracts/`,
      path: `${contractPath}/marketplace/v00`,
      file: 'Marketplace.sol',
      args: [OriginToken._address]
    })
    MarketplaceLib = new Marketplace({
      networkId,
      verbose: false,
      providers: {
        '999': web3.currentProvider
      },
      contractAddress: MarketplaceContract._address
    })
  })

  function setupMarketplaceLib(validOwners) {
    // Add marketplace JSON to marketplace library's list of known contracts.
    const marketplaceJson = JSON.parse(JSON.stringify(MarketplaceJson))
    marketplaceJson.contractName = testContractName
    marketplaceJson.networks[networkId] = {address: MarketplaceContract._address}
    MarketplaceLib.contractJsons.push(marketplaceJson)

    MarketplaceLib.validOwners = {}
    MarketplaceLib.validOwners[networkId] = validOwners
  }

  it('sets the contract owner', async () => {
    const newOwner = accounts[1]

    setupMarketplaceLib([ newOwner ])
    await MarketplaceLib.setOwner(networkId, testContractName, newOwner)
    assert.equal(newOwner, await MarketplaceContract.methods.owner().call())
  })

  it('does not set owner to non-whitelisted address', async () => {
    const invalidOwner = accounts[5]

    setupMarketplaceLib([ owner ])
    try {
      await MarketplaceLib.setOwner(networkId, testContractName, invalidOwner)
      assert(false)
    } catch(e) {
      assert(e.message.match(/not a valid owner/))
    }
  })

  it('allows owner to be any address with an empty whitelist', async () => {
    const newOwner = accounts[1]
    setupMarketplaceLib([])
    await MarketplaceLib.setOwner(networkId, testContractName, newOwner)
    assert.equal(newOwner, await MarketplaceContract.methods.owner().call())
  })

  it('sets the token address', async() => {
    const NewOriginToken = await deploy('OriginToken', {
      from: owner,
      path: `${contractPath}/token/`,
      args: [supply]
    })
    setupMarketplaceLib([ owner ])
    await MarketplaceLib.setTokenAddress(
      networkId,
      testContractName,
      NewOriginToken._address
    )
    assert.equal(
      await MarketplaceContract.methods.tokenAddr().call(),
      NewOriginToken._address
    )
  })

  it('does not set the token address to a different token', async() => {
    const DaiStableCoin = await deploy('Token', {
      from: owner,
      path: `${__dirname}/contracts/`,
      args: ['Dai', 'DAI', 2, 12000]
      // args: [12000]
    })
    setupMarketplaceLib([ owner ])
    try {
      await MarketplaceLib.setTokenAddress(
        networkId,
        testContractName,
        DaiStableCoin._address
      )
      assert(false)
    } catch(e) {
      assert(e.message.match(/instead of OGN/))
    }
  })
})
