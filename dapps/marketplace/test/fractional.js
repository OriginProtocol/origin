import { getPage } from './utils/_services'
import {
  changeAccount,
  waitForText,
  clickByText,
  clickBySelector,
  pic,
  waitUntilTextHides
} from './utils/_puppeteerHelpers'

import {
  reset,
  acceptOffer,
  confirmReleaseFundsAndRate
} from './utils/_actions'

function randomTitle() {
  return `3BHK apartment ${Math.floor(Math.random() * 100000)}`
}

function randomReview() {
  return `Very nice ${Math.floor(Math.random() * 100000)}`
}

export function fractionalTests({ autoSwap, acceptedTokens } = {}) {
  acceptedTokens =
    acceptedTokens && acceptedTokens.length ? acceptedTokens : ['ETH']
  describe(`Fractional Listing for Eth`, function() {
    let seller, buyer, title, review, page
    before(async function() {
      page = await getPage()
      ;({ seller, buyer } = await reset({ page, sellerOpts: { ogn: '100' } }))
      title = randomTitle({ isFractional: true })
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

    it('should select For Rent', async function() {
      await clickByText(page, 'For Rent')
    })

    it('should select Housing', async function() {
      await clickByText(page, 'Housing')
      await pic(page, 'add-listing')
    })

    it('should allow title and description entry', async function() {
      await page.type('input[name=title]', title)
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow price entry', async function() {
      await page.type('input[name=price]', '1')
      await page.type('input[name=weekendPrice]', '1')

      // All three payment modes are deselected by default
      // Select tokens that are not accepted by clicking them
      if (acceptedTokens.includes('ETH')) await clickByText(page, 'Ethereum')
      if (acceptedTokens.includes('DAI')) await clickByText(page, 'Maker Dai')
      if (acceptedTokens.includes('OGN'))
        await clickByText(page, 'Origin Token')

      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow changing availability and custom prices', async () => {
      await waitForText(page, 'Availability', 'h1')
      // TODO: To be updated after #3351 is fixed
      // const startDay = await page.$('.calendar:not(:first-child) .days .day:nth-child(9)')
      // const endDay = await page.$('.calendar:not(:first-child) .days .day:nth-child(15)')
      // await startDay.click()
      // await endDay.click()

      // const availabilityNo = await page.$('.availability-editor .form-group input[type=radio]')
      // await availabilityNo.click()

      // await clickByText(page, 'Save', 'button')

      await clickByText(page, 'Continue', 'button')
    })

    it('should allow location entry', async function() {
      await waitForText(page, 'Where is your listing located', 'div')
      await page.type('input[name=location]', 'Origin Protocol SF')
      await clickByText(page, 'Next', 'button')
      await waitForText(
        page,
        'This is what will be shown to potential guests',
        'div'
      )
      await clickByText(page, 'Continue', 'button')
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
      await clickByText(page, 'Continue', 'a')
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

    it('should switch to buyer account', async function() {
      await pic(page, 'listing-detail')
      await changeAccount(page, buyer)
    })

    it('should show availability', async function() {
      await clickByText(page, 'Availability', 'button')
    })

    it('should enter checkin/out dates', async function() {
      const startDay = await page.$(
        '.calendar:not(:first-child) .days .day:nth-child(9)'
      )
      const endDay = await page.$(
        '.calendar:not(:first-child) .days .day:nth-child(15)'
      )
      await startDay.click()
      await endDay.click()
    })

    it('should confirm checkin dates', async function() {
      await clickByText(page, 'Save', 'button')
      await waitUntilTextHides(page, 'Save', 'button')
    })

    it('should allow a new listing to be purchased', async function() {
      await waitForText(page, 'Total Price')

      await clickByText(page, 'Book')
      await clickByText(page, 'Ethereum')
      await clickByText(page, 'Continue', 'a')

      // Purchase confirmation
      await waitForText(page, 'Please confirm your purchase', 'h1')
      await pic(page, 'purchase-confirmation')

      // // TODO: Find a way to verify check in and check out dates in summary

      await clickByText(page, 'Book', 'button')

      await waitForText(page, 'View Purchase Details', 'button')
      await pic(page, 'purchase-listing')

      await clickByText(page, 'View Purchase Details', 'button')
      await waitForText(page, 'Transaction History')
      await pic(page, 'transaction-wait-for-seller')
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
      await waitForText(page, title, 'h2')
    })
  })
}
