/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */
import Web3 from 'web3'
import bip39 from 'bip39'
import hdkey from 'ethereumjs-wallet/hdkey'
import services from './_services'

const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')

let browser, webpackProcess, shutdownServices

async function mnemonicToAddress(mnemonic) {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const masterKey = hdkey.fromMasterSeed(seed)
  const masterWallet = masterKey.getWallet()
  return masterWallet.getChecksumAddressString()
}

before(async function() {
  this.timeout(60000)

  shutdownServices = await services()

  browser = shutdownServices.extrasResult.browser
  webpackProcess = shutdownServices.extrasResult.webpackProcess

  /**
   * Need to fund the master account for the Relayer Purse
   */
  const web3 = new Web3('http://localhost:8545')
  const netId = await web3.eth.net.getId()

  if (parseInt(netId) === 999) {
    if (!process.env.FORWARDER_MNEMONIC) {
      throw new Error('FORWARDER_MNEMONIC missing, setup failed!')
    }

    const masterAddress = await mnemonicToAddress(process.env.FORWARDER_MNEMONIC)
    const accounts = await web3.eth.getAccounts()
    const tx = {
      from: accounts[0],
      to: masterAddress,
      value: web3.utils.toWei('5', 'ether'),
      gas: '22000',
      gasPrice: web3.utils.toWei('2', 'gwei')
    }
    console.log('Funding with tx: ', tx)
    const receipt = await web3.eth.sendTransaction(tx)
    if (receipt.status) {
      console.log(`Successfully funded ${masterAddress}`)
    } else {
      throw new Error('Unable to fund relayer purse master account')
    }
  }
})

after(async function() {
  if (!isWatchMode) {
    if (browser) {
      await browser.close()
    }
    if (shutdownServices) {
      await shutdownServices()
    }
    if (webpackProcess) {
      webpackProcess.kill()
    }
  }
})
