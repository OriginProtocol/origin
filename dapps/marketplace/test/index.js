import {
  changeAccount,
  waitForText,
  clickByText,
  pic,
  createAccount
} from './_helpers'
import services from './_services'

let page

before(async function() {
  this.timeout(60000)
  page = (await services()).extrasResult.page
})

const reset = async () => {
  const seller = await createAccount(page)
  const buyer = await createAccount(page)
  await page.evaluate(() => {
    window.transactionPoll = 100
    window.sessionStorage.clear()
    window.location = '/#/'
  })
  return { buyer, seller }
}

const purchaseListing = async ({ buyer }) => {
  await pic(page, 'listing-detail')
  await changeAccount(page, buyer)
  await clickByText(page, 'Purchase', 'button')
  await waitForText(page, 'View Purchase', 'button')
  await pic(page, 'purchase-listing')

  await clickByText(page, 'View Purchase', 'button')
  await waitForText(page, 'Transaction Progress')
  await pic(page, 'transaction-wait-for-seller')
}

const acceptOffer = async ({ seller }) => {
  await changeAccount(page, seller)
  await waitForText(page, 'Accept Offer', 'button')
  await pic(page, 'transaction-accept')

  await clickByText(page, 'Accept Offer', 'button')
  await clickByText(page, 'OK', 'button')
  await waitForText(page, 'Wait for buyer')
  await pic(page, 'transaction-accepted')
}

const finalizeOffer = async ({ buyer }) => {
  await changeAccount(page, buyer)
  await waitForText(page, 'Finalize', 'button')
  await pic(page, 'transaction-finalize')
  await clickByText(page, 'Finalize', 'button')
  await clickByText(page, 'OK', 'button')
  await waitForText(page, 'Transaction Finalized')
  await pic(page, 'transaction-finalized')
}

describe('Marketplace Dapp', function() {
  let seller, buyer
  this.timeout(5000)

  describe('Single Unit Listing for Eth', function() {
    before(async function() {
      ({ seller, buyer } = await reset())
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
      await page.select('select', 'schema.clothingAccessories')
      await pic(page, 'add-listing')
    })

    it('should continue to details', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow detail entry', async function() {
      await page.type('input[name=title]', 'T-Shirt')
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await page.type('input[name=price]', '1')
      await page.click('#eth-checkbox') // Select Eth
      await page.click('#dai-checkbox') // De-select Dai
      const input = await page.$('input[type="file"]')
      await input.uploadFile(__dirname + '/fixtures/image-1.jpg')
      await page.waitForSelector('.image-picker .preview-row')

      await pic(page, 'add-listing')
    })

    it('should continue to boost', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should continue to review', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should create listing', async function() {
      await clickByText(page, 'Done', 'button')
      await waitForText(page, 'View Listing')
      await pic(page, 'add-listing')
    })

    it('should continue to listing', async function() {
      await clickByText(page, 'View Listing', 'button')
    })

    it('should allow a new listing to be purchased', async function() {
      await purchaseListing({ buyer })
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await finalizeOffer({ buyer })
    })
  })

  describe('Single Unit Listing for Dai', function() {
    before(async function() {
      ({ seller, buyer } = await reset())
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
      await page.select('select', 'schema.clothingAccessories')
      await pic(page, 'add-listing')
    })

    it('should continue to details', async function() {
      await clickByText(page, 'Continue')
      await pic(page, 'add-listing')
    })

    it('should allow detail entry', async function() {
      await page.type('input[name=title]', 'T-Shirt')
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await page.type('input[name=price]', '1')
      const input = await page.$('input[type="file"]')
      await input.uploadFile(__dirname + '/fixtures/image-1.jpg')
      await page.waitForSelector('.image-picker .preview-row')

      await pic(page, 'add-listing')
    })

    it('should continue to boost', async function() {
      await clickByText(page, 'Continue', 'button')
      await pic(page, 'add-listing')
    })

    it('should continue to review', async function() {
      await clickByText(page, 'Continue', 'button')
      await pic(page, 'add-listing')
    })

    it('should create listing', async function() {
      await clickByText(page, 'Done', 'button')
      await waitForText(page, 'View Listing', 'button')
      await pic(page, 'add-listing')
    })

    it('should continue to listing', async function() {
      await clickByText(page, 'View Listing', 'button')
      await pic(page, 'listing-detail')
    })

    it('should allow a new listing to be purchased', async function() {
      await changeAccount(page, buyer)
      await clickByText(page, 'Swap Now', 'button')
    })

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

      await clickByText(page, 'View Purchase', 'button')
      await waitForText(page, 'Transaction Progress')
      await pic(page, 'transaction-wait-for-seller')
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await finalizeOffer({ buyer })
    })
  })

  describe('Multi Unit Listing for Eth', function() {
    before(async function() {
      ({ seller, buyer } = await reset())
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
      await page.select('select', 'schema.clothingAccessories')
      await pic(page, 'add-listing')
    })

    it('should continue to details', async function() {
      await clickByText(page, 'Continue', 'button')
      await pic(page, 'add-listing')
    })

    it('should allow detail entry', async function() {
      await page.type('input[name=title]', 'T-Shirt')
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await page.type('input[name=price]', '1')
      await page.type('input[name=quantity]', '0') // Add a zero
      await page.click('#eth-checkbox') // Select Eth
      await page.click('#dai-checkbox') // De-select Dai
      const input = await page.$('input[type="file"]')
      await input.uploadFile(__dirname + '/fixtures/image-1.jpg')
      await page.waitForSelector('.image-picker .preview-row')

      await pic(page, 'add-listing')
    })

    it('should continue to boost', async function() {
      await clickByText(page, 'Continue', 'button')
      await pic(page, 'add-listing')
    })

    it('should continue to review', async function() {
      await clickByText(page, 'Continue', 'button')
      await pic(page, 'add-listing')
    })

    it('should create listing', async function() {
      await clickByText(page, 'Done', 'button')
      await waitForText(page, 'View Listing', 'button')
      await pic(page, 'add-listing')
    })

    it('should continue to listing', async function() {
      await clickByText(page, 'View Listing', 'button')
    })

    it('should allow a new listing to be purchased', async function() {
      await pic(page, 'listing-detail')
      await changeAccount(page, buyer)
      await page.waitForSelector('.quantity select')
      await page.select('.quantity select', '2')
      await clickByText(page, 'Purchase', 'button')
      await waitForText(page, 'View Purchase', 'button')
      await pic(page, 'purchase-listing')

      await clickByText(page, 'View Purchase', 'button')
      await waitForText(page, 'Transaction Progress')
      await pic(page, 'transaction-wait-for-seller')
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await finalizeOffer({ buyer })
    })
  })
})
