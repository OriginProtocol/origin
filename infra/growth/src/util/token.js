const BigNumber = require('bignumber.js')

const scaling = BigNumber(10).pow(18)

function tokenToNaturalUnits(x) {
  return BigNumber(x)
    .times(scaling)
    .toFixed()
}

function naturalUnitsToToken(x) {
  return BigNumber(x)
    .dividedBy(scaling)
    .toFixed()
}

module.exports = { tokenToNaturalUnits, naturalUnitsToToken }
