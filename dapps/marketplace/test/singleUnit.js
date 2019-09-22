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
  purchaseListingWithDAI,
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
  EthAndDaiAccepted
} = {}) {
  let testName = 'Single Unit Listing, payment in ETH'
  if (withShipping) testName += ', with Shipping'
  if (EthAndDaiAccepted) testName += ', both ETH and DAI accepted'

  describe(testName, function() {
    let seller, buyer, title, review, page
    before(async function() {
      page = await getPage()
      ;({ seller, buyer } = await reset({ page, sellerOpts: { ogn: '100' } }))
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
      await clickByText(page, 'Add Listing')
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
      // ETH is deselected in the UI by default. Always select it.
      // DAI is selected in the UI by default. Deselect it if EthAndDaiAccepted is not true.
      await clickByText(page, 'Ethereum')
      if (!EthAndDaiAccepted) {
        await clickByText(page, 'Maker Dai')
      }
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
      await purchaseListing({ page, buyer, withShipping, title })
      // Payment should always be in ETH, even if both ETH and DAI are accepted.
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

export function singleUnitDaiTests({ autoSwap, withShipping, buyerDai } = {}) {
  let testName = 'Single Unit Listing, payment in DAI'
  if (buyerDai) testName += ', buyer has DAI'
  if (withShipping) testName += ', with Shipping'

  describe(testName, function() {
    let seller, buyer, title, page
    before(async function() {
      page = await getPage()
      const resetOpts = { page }
      if (buyerDai) {
        resetOpts.buyerOpts = { dai: '100' }
      }
      ({ seller, buyer } = await reset(resetOpts))
      title = randomTitle()
    })

    it('should navigate to the Add Listing page', async function() {
      await changeAccount(page, seller)
      await clickByText(page, 'Add Listing')
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
      await purchaseListingWithDAI({
        page,
        buyer,
        autoSwap,
        withShipping,
        title,
        buyerDai
      })
    })

    if (!autoSwap && !buyerDai) {
      it('should prompt the user to approve their Dai', async function() {
        await waitForText(page, 'Approve', 'button')
        await pic(page, 'listing-detail')
        await clickByText(page, 'Approve', 'button')

        await waitForText(page, 'Origin may now move DAI on your behalf.')
        await pic(page, 'listing-detail')
      })
    }
    if (!autoSwap) {
      it('should prompt to continue with purchase', async function() {
        await clickByText(page, 'Continue', 'button')
        await waitForText(page, 'View Purchase', 'button')
        await pic(page, 'purchase-listing')
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
