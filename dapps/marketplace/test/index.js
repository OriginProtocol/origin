import assert from 'assert'
import { getPage } from './utils/_services'

import { singleUnitTests, singleUnitTokenTests } from './singleUnit'
import { multiUnitTests } from './multiUnit'
import { fractionalTests } from './fractional'
import { onboardingTests } from './onboarding'
import { userProfileTests } from './userProfile'
import { paymentTests } from './payments'

function listingTests({ autoSwap } = {}) {
  singleUnitTests({ autoSwap })
  singleUnitTests({ autoSwap, acceptedTokens: ['ETH', 'DAI', 'OGN'] })
  singleUnitTests({ autoSwap, withShipping: true })

  singleUnitTokenTests({ token: 'DAI', autoSwap })
  singleUnitTokenTests({ token: 'DAI', buyerHasTokens: true })
  singleUnitTokenTests({
    token: 'DAI',
    buyerHasTokens: true,
    deployIdentity: true
  })
  singleUnitTokenTests({ token: 'DAI', autoSwap, withShipping: true })

  singleUnitTokenTests({ token: 'OGN', buyerHasTokens: true })
  singleUnitTokenTests({
    token: 'OGN',
    buyerHasTokens: true,
    deployIdentity: true
  })
  singleUnitTokenTests({
    token: 'OGN',
    buyerHasTokens: true,
    withShipping: true
  })

  multiUnitTests({ autoSwap })
  multiUnitTests({ autoSwap, withShipping: true })

  fractionalTests({ autoSwap })
}

describe('Marketplace Dapp', function() {
  this.timeout(15000)
  before(async function() {
    const page = await getPage()
    await page.evaluate(() => {
      window.localStorage.clear()
      window.localStorage.bypassOnboarding = true
      window.transactionPoll = 100
    })
    await page.goto('http://localhost:8083')
  })

  paymentTests()
  listingTests()
  userProfileTests()
  onboardingTests()
})

describe('Marketplace Dapp with proxies enabled', function() {
  this.timeout(15000)
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

describe('Marketplace Dapp with proxies, relayer and performance mode enabled', function() {
  this.timeout(15000)

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
