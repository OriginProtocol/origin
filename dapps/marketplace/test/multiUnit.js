import assert from 'assert'
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
  acceptOffer,
  confirmReleaseFundsAndRate,
  purchaseMultiUnitListing
} from './utils/_actions'

function randomTitle({ isFractional } = {}) {
  if (isFractional) {
    return `3BHK apartment ${Math.floor(Math.random() * 100000)}`
  }
  return `T-Shirt ${Math.floor(Math.random() * 100000)}`
}

export function multiUnitTests({ autoSwap, withShipping } = {}) {
  let testName = 'Multi Unit Listing, payment in ETH'
  if (withShipping) testName += ', with Shipping'

  describe(testName, function() {
    let seller, buyer, title, listingHash, page
    before(async function() {
      page = await getPage()
      ;({ seller, buyer } = await reset({ page, sellerOpts: { ogn: '100' } }))
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

    it('should allow detail entry', async function() {
      await page.focus('input[name=quantity]')
      await page.keyboard.press('Backspace')
      await page.type('input[name=quantity]', '2')

      if (!withShipping) {
        await waitForText(page, 'Require Shipping')
        await clickByText(page, 'No')
      }

      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow price entry', async function() {
      await page.type('input[name=price]', '1')
      await clickByText(page, 'Ethereum') // Select Eth
      await clickByText(page, 'Maker Dai') // De-select Dai
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
      await waitForText(page, 'Promote Now')
      await pic(page, 'add-listing')
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

    it('should continue to OGN budget', async function() {
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
      await waitForText(page, title, 'h2')
      listingHash = await page.evaluate(() => window.location.hash)
    })

    it('should have the correct sales numbers', async function() {
      await page.waitForSelector('.listing-buy-editonly')
      const sold = await page.$('.listing-buy-editonly')
      const sales = await page.evaluate(el => el.innerText, sold)
      assert(
        sales.replace(/[\n\t\r ]+/g, ' ') === 'Sold 0 Pending 0 Available 2'
      )
    })

    it('should have the correct commission numbers', async function() {
      await page.waitForSelector('.listing-commission')
      const commission = await page.$('.listing-commission')
      const commissionTxt = await page.evaluate(el => el.innerText, commission)
      assert(
        commissionTxt
          .replace(/[\n\t\r ]+/g, ' ')
          .startsWith(
            'Commission per Unit 10 Total Budget 20 Total Budget Remaining 20'
          )
      )
    })

    it('should allow a new listing to be purchased', async function() {
      await purchaseMultiUnitListing({ page, buyer, withShipping, title })
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ page, seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await confirmReleaseFundsAndRate({ page, buyer })
    })

    it('should navigate back to the listing', async function() {
      await changeAccount(page, seller)
      await page.evaluate(l => {
        window.location = l
      }, `/${listingHash}`)
    })

    it('should allow the listing to be edited', async function() {
      await clickBySelector(
        page,
        '.listing-buy-editonly + a.listing-action-link'
      )
      await clickByText(page, 'For Sale')
      await clickByText(page, 'Continue')
      await page.focus('input[name=quantity]')
      await page.keyboard.press('Backspace')
      await page.type('input[name=quantity]', '10')
      await clickByText(page, 'Continue')
      await clickByText(page, 'Continue')
      await clickByText(page, 'Continue')
      await clickByText(page, 'Publish', 'button')
      await clickByText(page, 'View My Listing', 'a')
    })

    it('should have the edited sales numbers', async function() {
      await page.waitForSelector('.listing-buy-editonly')
      const sold = await page.$('.listing-buy-editonly')
      const sales = await page.evaluate(el => el.innerText, sold)
      assert(
        sales.replace(/[\n\t\r ]+/g, ' ') === `Sold 2 Pending 0 Available 8`
      )
    })

    it('should have the updated commission numbers', async function() {
      await page.waitForSelector('.listing-commission')
      const commission = await page.$('.listing-commission')
      const commissionTxt = await page.evaluate(el => el.innerText, commission)
      assert(
        commissionTxt
          .replace(/[\n\t\r ]+/g, ' ')
          .startsWith(
            'Commission per Unit 10 Total Budget 20 Total Budget Remaining 0'
          )
      )
    })

    it('should allow the edited listing to be purchased', async function() {
      await purchaseMultiUnitListing({ page, buyer, withShipping, title })
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ page, seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await confirmReleaseFundsAndRate({ page, buyer })
    })
  })
}
