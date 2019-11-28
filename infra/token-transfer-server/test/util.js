const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect

// Mock for the Token class in the @origin/token package.
class TokenMock {
  constructor(networkId, fromAddress, toAddress) {
    this.networkId = networkId
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.decimals = 18
    this.scaling = BigNumber(10).exponentiatedBy(this.decimals)
  }

  async defaultAccount() {
    return this.fromAddress
  }

  async credit(address, value) {
    expect(address).to.equal(this.toAddress)
    expect(value.toNumber()).to.be.an('number')
    return 'testTxHash'
  }

  async waitForTxConfirmation(txHash) {
    return {
      status: 'confirmed',
      receipt: { txHash, blockNumber: 123, status: true }
    }
  }

  toNaturalUnit(value) {
    return BigNumber(value).multipliedBy(this.scaling)
  }
}

module.exports = {
  TokenMock
}
