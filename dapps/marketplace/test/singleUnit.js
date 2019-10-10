import { getPage } from './utils/_services'

import {
  changeAccount,
  waitForText,
  clickByText,
  clickBySelector,
  pic
} from './utils/_puppeteerHelpers'

import {
  reset,
  purchaseListing,
  acceptOffer,
  confirmReleaseFundsAndRate
} from './utils/_actions'

function randomTitle() {
  return `T-Shirt ${Math.floor(Math.random() * 100000)}`
}

function randomReview() {
  return `Very good ${Math.floor(Math.random() * 100000)}`
}

export function singleUnitTests({
  autoSwap,
  withShipping,
  deployIdentity,
  acceptedTokens
} = {}) {
  let testName = 'Single Unit Listing, payment in ETH'
  if (withShipping) testName += ', with Shipping'

  acceptedTokens =
    acceptedTokens && acceptedTokens.length ? acceptedTokens : ['ETH']
  if (acceptedTokens.length > 1)
    testName += ` | ${acceptedTokens.join(',')} accepted`

  describe(testName, function() {
    let seller, buyer, title, review, page
    before(async function() {
      page = await getPage()
      const accounts = await reset({
        page,
        sellerOpts: { ogn: '100', deployIdentity }
      })
      seller = accounts.seller
      buyer = accounts.buyer
      title = randomTitle()
      review = randomReview()
    })

    it('should switch to Seller account', async function() {
      await changeAccount(page, seller)
    })

    it('should have no Purchases', async function() {
      await clickByText(page, 'Purchases', 'a/span')
      await waitForText(page, 'You haven’t bought anything yet.')
    })

    it('should have no Listings', async function() {
      await clickByText(page, 'Listings', 'a/span')
      await waitForText(page, "You don't have any listings yet.")
    })

    it('should have no Sales', async function() {
      await clickByText(page, 'Sales', 'a/span')
      await waitForText(page, 'You haven’t sold anything yet.')
    })

    it('should have no Notifications', async function() {
      await clickBySelector(page, '.nav-item.notifications a')
      await page.waitForFunction(
        `(function() {
          try {
            const selector = '.notifications.dropdown .dropdown-menu .count'
            return document.querySelector(selector).innerText.replace(/\\s/, ' ').includes("0 Notifications")
          } catch(e) {
            return false
          }
        })()`
      )
    })

    it('should navigate to the Add Listing page', async function() {
      await clickByText(page, 'Add Listing', 'a/span')
      await pic(page, 'add-listing')
    })

    it('should select For Sale', async function() {
      await clickByText(page, 'For Sale')
    })

    it('should select Clothing', async function() {
      await clickByText(page, 'Clothing and Accessories')
      await pic(page, 'add-listing')
    })

    it('should allow title and description entry', async function() {
      await page.type('input[name=title]', title)
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow quantity entry', async function() {
      if (!withShipping) {
        await waitForText(page, 'Require Shipping')
        await clickByText(page, 'No')
      }
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow price entry', async function() {
      await page.type('input[name=price]', '1')
      // All three payment modes are deselected by default
      // Select tokens that are not accepted by clicking them
      if (acceptedTokens.includes('ETH')) await clickByText(page, 'Ethereum')
      if (acceptedTokens.includes('DAI')) await clickByText(page, 'Maker Dai')
      if (acceptedTokens.includes('OGN'))
        await clickByText(page, 'Origin Token')

      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow image entry', async function() {
      const input = await page.$('input[type="file"]')
      await input.uploadFile(__dirname + '/fixtures/image-1.jpg')
      await page.waitForSelector('.image-picker .preview-row')
      await pic(page, 'add-listing')
    })

    it('should continue to review', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should create listing', async function() {
      await clickByText(page, 'Publish', 'button')
      await waitForText(page, 'Promote Now', 'a')
      await pic(page, 'add-listing')
    })

    it('should continue to listing', async function() {
      await clickByText(page, 'View My Listing', 'a')
    })

    it('should have listing under Listings tab', async function() {
      await clickByText(page, 'Listings', 'a/span')
      await waitForText(page, 'Listings', 'h1')
      await waitForText(page, title, 'a')
      await clickByText(page, title, 'a')
    })

    it('should continue to listing promotion', async function() {
      await clickByText(page, 'Promote Now', 'a')
    })

    it('should continue to OGN entry', async function() {
      await clickByText(page, 'Continue', 'a')
    })

    it('should wait for correct OGN balance', async function() {
      await page.waitForFunction(
        `document.querySelector('.promote-listing .balance').innerText.includes("OGN Balance: 100")`
      )
    })

    it('should enter 10 OGN', async function() {
      await page.type('input[name=commissionPerUnit]', '10')
    })

    it('should allow promotion tx', async function() {
      await clickByText(page, 'Promote Now', 'button')
    })

    if (autoSwap) {
      it('should prompt the user to approve their OGN', async function() {
        await clickByText(page, 'Promote Now', 'button')
      })
    }

    it('should allow listing to be viewed', async function() {
      await clickByText(page, 'View My Listing', 'a')
    })

    it('should allow a new listing to be purchased', async function() {
      await purchaseListing({
        page,
        buyer,
        withShipping,
        title,
        withToken: 'ETH'
      })
    })

    it('should go to transaction detail page and have correct currency', async function() {
      await waitForText(page, 'View Purchase Details', 'button')
      await pic(page, 'purchase-listing')

      await clickByText(page, 'View Purchase Details', 'button')
      await waitForText(page, 'Transaction History')
      await pic(page, 'transaction-wait-for-seller')

      await page.waitForFunction(
        `document.querySelector('.escrow-amount').innerText.includes("ETH")`
      )
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ page, seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await confirmReleaseFundsAndRate({ page, buyer, review })
    })

    it('should have review on listing', async function() {
      await clickByText(page, 'View Listing', 'li/div/a')
      await waitForText(page, review, 'div')
    })

    it('should have purchase in Complete Purchases tab', async function() {
      await clickByText(page, 'Purchases', 'a/span')
      await waitForText(page, 'Purchases', 'h1')
      await clickByText(page, 'Complete', 'a')
      await waitForText(page, title, 'a')
    })
  })
}

export function singleUnitTokenTests({
  autoSwap,
  withShipping,
  buyerHasTokens,
  deployIdentity,
  token
} = {}) {
  let testName = 'Single Unit Listing, payment in ' + token
  if (buyerHasTokens) testName += ', buyer has ' + token
  if (withShipping) testName += ', with Shipping'
  if (deployIdentity) testName += ', with existing Identity'

  describe(testName, function() {
    let seller, buyer, title, page
    before(async function() {
      page = await getPage()
      const resetOpts = { page, deployIdentity }
      if (buyerHasTokens) {
        resetOpts.buyerOpts = {
          dai: token === 'DAI' ? '100' : undefined,
          ogn: token === 'OGN' ? '100' : undefined,
          deployIdentity
        }
      }
      // eslint-disable-next-line no-extra-semi
      ;({ seller, buyer } = await reset(resetOpts))
      title = randomTitle()
    })

    it('should navigate to the Add Listing page', async function() {
      await changeAccount(page, seller)
      await clickByText(page, 'Add Listing', 'a/span')
      await pic(page, 'add-listing')
    })

    it('should select For Sale', async function() {
      await clickByText(page, 'For Sale')
    })

    it('should select Clothing', async function() {
      await clickByText(page, 'Clothing and Accessories')
      await pic(page, 'add-listing')
    })

    it('should allow title and description entry', async function() {
      await page.type('input[name=title]', title)
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow quantity entry', async function() {
      if (!withShipping) {
        await waitForText(page, 'Require Shipping')
        await clickByText(page, 'No')
      }

      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow price entry', async function() {
      await page.type('input[name=price]', '1')

      await clickByText(page, 'Ethereum')
      await clickByText(page, 'Maker Dai')
      await clickByText(page, 'Origin Token')

      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow image entry', async function() {
      const input = await page.$('input[type="file"]')
      await input.uploadFile(__dirname + '/fixtures/image-1.jpg')
      await page.waitForSelector('.image-picker .preview-row')
      await pic(page, 'add-listing')
    })

    it('should continue to review', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should create listing', async function() {
      await clickByText(page, 'Publish', 'button')
      await waitForText(page, 'View My Listing', 'a')
      await pic(page, 'add-listing')
    })

    it('should continue to listing', async function() {
      await clickByText(page, 'View My Listing', 'a')
      await pic(page, 'listing-detail')
    })

    it('should allow a new listing to be purchased', async function() {
      await purchaseListing({
        page,
        buyer,
        autoSwap,
        withShipping,
        title,
        buyerHasTokens,
        withToken: token
      })
    })

    if (token === 'DAI' && !autoSwap) {
      if (!buyerHasTokens) {
        it('should prompt the user to approve their Dai', async function() {
          await waitForText(page, 'Approve', 'button')
          await pic(page, 'listing-detail')
          await clickByText(page, 'Approve', 'button')

          await waitForText(page, 'Origin may now move DAI on your behalf.')
          await pic(page, 'listing-detail')
        })
      }

      it('should prompt to continue with purchase', async function() {
        await clickByText(page, 'Continue', 'button')
        await waitForText(page, 'View Purchase', 'button')
        await pic(page, 'purchase-listing')
      })
    }

    if (token === 'OGN') {
      it(`should show approved modal for ${token}`, async function() {
        // TBD: OGN contract is auto-approved? If yes, should we show this modal at all?
        await waitForText(page, `Origin may now move ${token} on your behalf.`)
        await pic(page, 'listing-detail')
        await clickByText(page, 'Continue', 'button')
      })
    }

    it('should view the purchase', async function() {
      await clickByText(page, 'View Purchase', 'button')
      await waitForText(
        page,
        `You've made an offer. Wait for the seller to accept it.`
      )
      await pic(page, 'transaction-wait-for-seller')
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ page, seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await confirmReleaseFundsAndRate({ page, buyer })
    })
  })
}
