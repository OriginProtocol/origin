import ContractService from '../src/services/contract-service'
import Token from '../src/resources/token.js'

import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken.json'

import assert from 'assert'

import Web3 from 'web3'

class MarketplaceMock {
  constructor(tokenAddress) {
    this.tokenAddress = tokenAddress
  }

  async getTokenAddress() {
    return this.tokenAddress
  }
}

describe('Origin Token Resource', function() {
  const initialSupply = 100
  let TokenResource, OriginToken
  let accounts, owner

  this.timeout(5000) // default is 2000

  beforeEach(async function() {
    const web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545')
    )
    accounts = await web3.eth.getAccounts()
    owner = accounts[0]

    const contractService = new ContractService({ web3 })
    const deployReceipt = await contractService.deploy(
      contractService.contracts['OriginToken'],
      [initialSupply],
      { from: owner, gas: 4000000 }
    )
    const marketplace = new MarketplaceMock(deployReceipt.contractAddress)
    TokenResource = new Token({ contractService, marketplace })
    OriginToken = new web3.eth.Contract(
      OriginTokenContract.abi,
      deployReceipt.contractAddress
    )
  })

  it('returns balance of owner', async function() {
    assert.equal(await TokenResource.balanceOf(owner), initialSupply)
  })

  it('returns correct balances after transfer', async function() {
    const other = accounts[1]
    const amount = 3
    assert.notEqual(owner, other)
    await OriginToken.methods.transfer(other, amount).send({ from: owner })
    assert.equal(await TokenResource.balanceOf(owner), initialSupply - amount)
    assert.equal(await TokenResource.balanceOf(other), amount)
  })

  it('does not start paused', async function() {
    assert.equal(await TokenResource.isPaused(), false)
  })

  it('returns paused when token contract is paused', async function() {
    await OriginToken.methods.pause().send({ from: owner })
    assert.equal(await TokenResource.isPaused(), true)
  })
})
