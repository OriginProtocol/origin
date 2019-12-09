const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect

// Mock for the Token class in the @origin/token package.
class TokenMock {
  constructor() {
    this.decimals = 18
    this.scaling = BigNumber(10).exponentiatedBy(this.decimals)
  }

  async defaultAccount() {
    return '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  }

  async credit(address, value) {
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
