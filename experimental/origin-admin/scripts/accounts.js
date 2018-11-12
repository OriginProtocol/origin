/**
 * Generates a list of accounts and private keys given a mnemonic
 */

var bip39 = require('bip39')
var HDKey = require('hdkey')
var Web3 = require('web3')
var web3 = new Web3()

const mnemonic = process.argv.slice(2).join(' ')

if (!mnemonic) {
  console.log("\nUsage: node accounts.js [mnemonic]")
  console.log("eg node accounts.js candy maple cake sugar pudding cream honey rich smooth crumble sweet treat\n")
  process.exit()
}

console.log(`\nMnemonic: ${mnemonic}\n`)

for (var offset = 0; offset < 10; offset++) {
  var seed = bip39.mnemonicToSeed(mnemonic)
  var acct = HDKey.fromMasterSeed(seed).derive("m/44'/60'/0'/0/" + offset)
  var account = web3.eth.accounts.privateKeyToAccount(
    `0x${acct.privateKey.toString('hex')}`
  )
  console.log(`${account.address} - ${account.privateKey}`)
}

console.log()
process.exit()
