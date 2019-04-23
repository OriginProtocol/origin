/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */

import services from './_services'

const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')

let browser, webpackProcess, shutdownServices

before(async function() {
  this.timeout(60000)

  shutdownServices = await services()

  browser = shutdownServices.extrasResult.browser
  webpackProcess = shutdownServices.extrasResult.webpackProcess
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
