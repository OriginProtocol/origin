import assert from 'assert'
import { getPage } from './utils/_services'

import { singleUnitTests, singleUnitDaiTests } from './singleUnit'
import { multiUnitTests } from './multiUnit'
import { fractionalTests } from './fractional'
import { onboardingTests } from './onboarding'
import { userProfileTests } from './userProfile'

function listingTests({ autoSwap } = {}) {
  singleUnitTests({ autoSwap })
  singleUnitTests({ autoSwap, EthAndDaiAccepted: true })
  singleUnitTests({ autoSwap, withShipping: true })

  singleUnitDaiTests({ autoSwap })
  singleUnitDaiTests({ buyerDai: true })
  singleUnitDaiTests({ buyerDai: true, deployIdentity: true })
  singleUnitDaiTests({ autoSwap, withShipping: true })

  multiUnitTests({ autoSwap })
  multiUnitTests({ autoSwap, withShipping: true })

  fractionalTests({ autoSwap })
}

describe('Marketplace Dapp', function() {
  this.timeout(10000)
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.localStorage.promoteEnabled = 'true'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })

  listingTests()
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies enabled', function() {
  this.timeout(10000)
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.proxyAccountsEnabled = true
      window.localStorage.bypassOnboarding = true
      window.localStorage.promoteEnabled = 'true'
      window.localStorage.debug = 'origin:*'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })
  listingTests({ autoSwap: true })
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies, relayer and performance mode enabled', function() {
  this.timeout(10000)

  let page, didThrow

  function pageError(err) {
    didThrow = err
  }

  before(async function() {
    page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.localStorage.performanceMode = true
      window.localStorage.proxyAccountsEnabled = true
      window.localStorage.relayerEnabled = true
      window.localStorage.debug = 'origin:*'
      window.localStorage.promoteEnabled = 'true'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })

  beforeEach(() => {
    page.on('pageerror', pageError)
    page.on('error', pageError)
  })

  afterEach(() => {
    page.removeListener('pageerror', pageError)
    page.removeListener('error', pageError)
    assert(!didThrow, 'Page error detected: ' + didThrow)
  })

  listingTests({ autoSwap: true })
  userProfileTests()
  onboardingTests()
})
