/**
 * Generates a list of accounts and private keys given a mnemonic
 */

const bip39 = require('bip39')
const HDKey = require('hdkey')
const Web3 = require('web3')
const web3 = new Web3()

const mnemonic = process.argv.slice(2).join(' ')

if (!mnemonic) {
  console.log('\nUsage: node accounts.js [mnemonic]')
  console.log(
    'eg node accounts.js candy maple cake sugar pudding cream honey rich smooth crumble sweet treat\n'
  )
  process.exit()
}

console.log(`\nMnemonic: ${mnemonic}\n`)

for (let offset = 0; offset < 10; offset++) {
  const seed = bip39.mnemonicToSeed(mnemonic)
  const acct = HDKey.fromMasterSeed(seed).derive("m/44'/60'/0'/0/" + offset)
  const account = web3.eth.accounts.privateKeyToAccount(
    `0x${acct.privateKey.toString('hex')}`
  )
  console.log(`${account.address} - ${account.privateKey}`)
}

console.log()
process.exit()
