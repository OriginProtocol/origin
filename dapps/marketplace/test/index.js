import { changeAccount, waitForText, clickByText, pic } from './_helpers'

const page = global.page

describe('Marketplace Dapp', function() {
  it('should allow a new listing to be created', async function() {
    this.timeout(30000)

    await changeAccount(page, 'seller')
    await clickByText(page, 'Add Listing')
    await pic(page, 'add-listing')

    await clickByText(page, 'For Sale')
    await page.select('select', 'schema.clothingAccessories')
    await pic(page, 'add-listing')

    await clickByText(page, 'Continue')
    await pic(page, 'add-listing')

    await page.type('input[name=title]', 'T-Shirt')
    await page.type('textarea[name=description]', 'T-Shirt in size large')
    await page.type('input[name=price]', '0.01')
    const input = await page.$('input[type="file"]')
    await input.uploadFile('./test/fixtures/image-1.jpg')

    await pic(page, 'add-listing')

    await clickByText(page, 'Continue')
    await pic(page, 'add-listing')

    await clickByText(page, 'Review')
    await pic(page, 'add-listing')

    await clickByText(page, 'Done')
    await waitForText(page, 'View Listing')
    await pic(page, 'add-listing')

    await clickByText(page, 'View Listing')
  })

  it('should allow a new listing to be purchased', async function() {
    this.timeout(10000)
    await pic(page, 'listing-detail')
    await changeAccount(page, 'buyer')
    await clickByText(page, 'Purchase')
    await waitForText(page, 'View Purchase')
    await pic(page, 'purchase-listing')

    await clickByText(page, 'View Purchase')
    await waitForText(page, 'Transaction Progress')
    await pic(page, 'transaction-wait-for-seller')
  })

  it('should allow a new listing to be accepted', async function() {
    this.timeout(10000)
    await changeAccount(page, 'seller')
    await waitForText(page, 'Accept or Reject')
    await pic(page, 'transaction-accept')
    await clickByText(page, 'Accept Offer')
    await clickByText(page, 'OK')
    await waitForText(page, 'Wait for buyer')
    await pic(page, 'transaction-accepted')
  })

  it('should allow a new listing to be finalized', async function() {
    this.timeout(10000)
    await changeAccount(page, 'buyer')
    await waitForText(page, 'Leave a review')
    await pic(page, 'transaction-finalize')
    await clickByText(page, 'Finalize')
    await clickByText(page, 'OK')
    await waitForText(page, 'Transaction Finalized')
    await pic(page, 'transaction-finalized')
  })
})
