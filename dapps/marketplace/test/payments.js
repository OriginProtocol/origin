import { getPage } from './utils/_services'

import {
  changeAccount,
  createListing,
  waitForText,
  clickByText,
  pic
} from './utils/_puppeteerHelpers'

import { reset, purchaseListing } from './utils/_actions'

function randomTitle() {
  return `T-Shirt ${Math.floor(Math.random() * 100000)}`
}

function tokenPaymentTests({ deployIdentity, autoSwap, token }) {
  describe(`Listing payments - ${token}`, function() {
    let seller, buyer, title, page, listing
    before(async function() {
      page = await getPage()
      title = randomTitle()
      const accounts = await reset({
        page,
        sellerOpts: { deployIdentity },
        buyerOpts: { ogn: token === 'OGN' ? '1' : undefined }
      })
      seller = accounts.seller
      buyer = accounts.buyer
    })

    it(`should allow creation of ${token} only listing`, async function() {
      await changeAccount(page, seller)
      listing = await createListing(page, {
        from: seller,
        title,
        acceptedTokens: [`token-${token}`]
      })
      await page.evaluate(listingId => {
        window.location = `/#/listing/999-001-${listingId}`
      }, listing)
    })

    it('should allow the listing to be purchased', async function() {
      await changeAccount(page, buyer)
      await purchaseListing({ page, buyer, title, autoSwap, withToken: token })
    })

    if (!autoSwap) {
      if (token === 'DAI') {
        it(`should prompt the user to approve their ${token}`, async function() {
          await waitForText(page, 'Approve', 'button')
          await pic(page, 'listing-detail')
          await clickByText(page, 'Approve', 'button')

          await waitForText(
            page,
            `Origin may now move ${token} on your behalf.`
          )
          await pic(page, 'listing-detail')
        })
      } else {
        it(`should show approved modal for ${token}`, async function() {
          // TBD: OGN contract is auto-approved? If yes, should we show this modal at all?
          await waitForText(
            page,
            `Origin may now move ${token} on your behalf.`
          )
          await pic(page, 'listing-detail')
        })
      }

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

export function paymentTests({ deployIdentity, autoSwap } = {}) {
  tokenPaymentTests({ deployIdentity, autoSwap, token: 'DAI' })
  tokenPaymentTests({ deployIdentity, autoSwap, token: 'OGN' })
}
