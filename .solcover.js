require('babel-register')
require('babel-polyfill')

module.exports = {
    copyPackages: ['openzeppelin-solidity'],
    dir: './contracts',
    // for Mocha tests
    testCommand: 'mocha -r babel-register -r babel-polyfill -t 10000 --exit ../contracts/test-alt/',
    // for Truffle tests (this runs out of gas)
    // testCommand: 'npx truffle test --network coverage',
}
