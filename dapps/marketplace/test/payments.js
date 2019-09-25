import { getPage } from './utils/_services'

import {
  changeAccount,
  createListing,
  waitForText,
  clickByText,
  pic
} from './utils/_puppeteerHelpers'

import { reset, purchaseListingWithDAI } from './utils/_actions'

function randomTitle() {
  return `T-Shirt ${Math.floor(Math.random() * 100000)}`
}

export function paymentTests({ deployIdentity, autoSwap } = {}) {
  describe('Listing payments', function() {
    let seller, buyer, title, page, listing
    before(async function() {
      page = await getPage()
      title = randomTitle()
      const accounts = await reset({
        page,
        sellerOpts: { deployIdentity }
      })
      seller = accounts.seller
      buyer = accounts.buyer
    })

    it('should allow creation of Dai only listing', async function() {
      await changeAccount(page, seller)
      listing = await createListing(page, {
        from: seller,
        title,
        acceptedTokens: ['token-DAI']
      })
      await page.evaluate(listingId => {
        window.location = `/#/listing/999-001-${listingId}`
      }, listing)
    })

    it('should allow listing to be purchased', async function() {
      await changeAccount(page, buyer)
      await purchaseListingWithDAI({ page, buyer, title, autoSwap })
    })

    if (!autoSwap) {
      it('should prompt the user to approve their Dai', async function() {
        await waitForText(page, 'Approve', 'button')
        await pic(page, 'listing-detail')
        await clickByText(page, 'Approve', 'button')

        await waitForText(page, 'Origin may now move DAI on your behalf.')
        await pic(page, 'listing-detail')
      })

      it('should prompt to continue with purchase', async function() {
        await clickByText(page, 'Continue', 'button')
        await waitForText(page, 'View Purchase', 'button')
        await pic(page, 'purchase-listing')
      })
    }

    it('should view the purchase', async function() {
      await clickByText(page, 'View Purchase', 'button')
      await waitForText(page, `You've made an offer.`)
      await pic(page, 'transaction-wait-for-seller')
    })
  })
}
