const BigNumber = require('bignumber.js')

function tokenNaturalUnits(x) {
  return BigNumber(x)
    .times(BigNumber(10).pow(18))
    .toFixed()
}

module.exports = tokenNaturalUnits