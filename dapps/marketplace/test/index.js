import assert from 'assert'
import { getPage } from './utils/_services'

import { singleUnitTests, singleUnitTokenTests } from './singleUnit'
import { multiUnitTests } from './multiUnit'
import { fractionalTests } from './fractional'
import { onboardingTests } from './onboarding'
import { userProfileTests } from './userProfile'
import { paymentTests } from './payments'

function listingTests({ autoSwap } = {}) {
  const nonSwappableTokens = ['OGN', 'OKB', 'USDT']

  singleUnitTests({ autoSwap })
  singleUnitTests({
    autoSwap,
    acceptedTokens: ['ETH', 'DAI', ...nonSwappableTokens]
  })
  singleUnitTests({ autoSwap, withShipping: true })

  // Tests for DAI listings
  singleUnitTokenTests({ token: 'DAI', autoSwap })
  singleUnitTokenTests({ token: 'DAI', buyerHasTokens: true })
  singleUnitTokenTests({
    token: 'DAI',
    buyerHasTokens: true,
    deployIdentity: true
  })
  singleUnitTokenTests({ token: 'DAI', autoSwap, withShipping: true })

  nonSwappableTokens.map(token => {
    // Tests for OGN listings
    singleUnitTokenTests({ token, buyerHasTokens: true })
    singleUnitTokenTests({
      token,
      buyerHasTokens: true,
      deployIdentity: true
    })
    singleUnitTokenTests({
      token,
      buyerHasTokens: true,
      withShipping: true
    })
  })

  multiUnitTests({ autoSwap })
  multiUnitTests({ autoSwap, withShipping: true })

  fractionalTests({ autoSwap })
}

describe('Marketplace Dapp.', function() {
  this.timeout(15000)
  this.retries(2) // This can help with flaky tests
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.localStorage.debug = 'origin:*'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })

  paymentTests()
  listingTests()
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies.', function() {
  this.timeout(15000)
  this.retries(2)
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.proxyAccountsEnabled = true
      window.localStorage.bypassOnboarding = true
      window.localStorage.debug = 'origin:*'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })
  paymentTests({ autoSwap: true })
  listingTests({ autoSwap: true })
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies, performance mode, relayer.', function() {
  this.timeout(15000)
  this.retries(2)

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

  paymentTests({ autoSwap: true })
  listingTests({ autoSwap: true })
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies, performance mode, broken relayer.', function() {
  this.timeout(15000)
  this.retries(2)

  let page

  before(async function() {
    page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.localStorage.performanceMode = true
      window.localStorage.proxyAccountsEnabled = true
      window.localStorage.relayerEnabled = true
      window.localStorage.debug = 'origin:*'
      window.transactionPoll = 100
    })

    function intercepted(interceptedRequest) {
      if (interceptedRequest.url().indexOf('/relay') > 0) {
        interceptedRequest.abort()
      } else {
        interceptedRequest.continue()
      }
    }

    before(async function() {
      // Simulate an unresponsive relay server
      await page.setRequestInterception(true)
      page.on('request', intercepted)
    })

    after(async function() {
      page.removeListener('request', intercepted)
      await page.setRequestInterception(false)
    })

    await page.goto('http://localhost:8083')
  })

  paymentTests({ autoSwap: true })
  listingTests({ autoSwap: true })
  userProfileTests()
  onboardingTests()
})

// TODO(franck): fix this test.
describe.skip('Centralized Identity.', function() {
  this.timeout(15000)
  this.retries(2) // This can help with flaky tests
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.localStorage.centralizedIdentityEnabled = true
      window.localStorage.proxyAccountsEnabled = true
      window.localStorage.debug = 'origin:*'
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })

  userProfileTests(true)
})
