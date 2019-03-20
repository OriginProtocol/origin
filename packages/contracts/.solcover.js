require('babel-register')
require('babel-polyfill')

module.exports = {
    copyPackages: ['openzeppelin-solidity'],
    testCommand: 'npm run test',
    // for Truffle tests (this runs out of gas)
    // testCommand: 'truffle test --network coverage',
}
