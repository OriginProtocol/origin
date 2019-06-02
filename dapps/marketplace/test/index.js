import {
  changeAccount,
  waitForText,
  // hasText,
  clickByText,
  clickBySelector,
  pic,
  createAccount
  // deployIdentity
} from './_helpers'
import services from './_services'
import assert from 'assert'

let page

before(async function() {
  this.timeout(60000)
  page = (await services()).extrasResult.page
})

const reset = async () => {
  const seller = await createAccount(page)
  const buyer = await createAccount(page)
  // await deployIdentity(page, seller)
  // await deployIdentity(page, buyer)

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

function randomTitle() {
  return `T-Shirt ${Math.floor(Math.random() * 100000)}`
}

describe('Marketplace Dapp', function() {
  let seller, buyer
  this.timeout(10000)

  describe('Single Unit Listing for Eth', function() {
    const listingTitle = randomTitle()
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
      await page.type('input[name=title]', listingTitle)
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
      await page.type('input[name=title]', randomTitle())
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
    let listingHash
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
      await page.type('input[name=title]', randomTitle())
      await page.type('textarea[name=description]', 'T-Shirt in size large')
      await page.type('input[name=price]', '1')
      await page.focus('input[name=quantity]')
      await page.keyboard.press('Backspace')
      await page.type('input[name=quantity]', '2')
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
      listingHash = await page.evaluate(() => window.location.hash)
    })

    it('should have the correct sales numbers', async function() {
      await page.waitForSelector('.listing-buy-editonly')
      const sold = await page.$('.listing-buy-editonly')
      const sales = await page.evaluate(el => el.innerText, sold)
      assert(sales.replace(/\n/g, ' ') === 'Sold 0 Pending 0 Available 2')
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

    it('should navigate back to the listing', async function() {
      await changeAccount(page, seller)
      await page.evaluate(l => {
        window.location = l
      }, `/${listingHash}`)
    })

    it('should allow the listing to be edited', async function() {
      await clickByText(page, 'Edit Listing')
      await clickByText(page, 'Continue')
      await page.focus('input[name=quantity]')
      await page.keyboard.press('Backspace')
      await page.type('input[name=quantity]', '10')
      await clickByText(page, 'Continue')
      await clickByText(page, 'Continue')
      await clickByText(page, 'Done')
      await clickByText(page, 'View Listing', 'button')
    })

    it('should have the edited sales numbers', async function() {
      await page.waitForSelector('.listing-buy-editonly')
      const sold = await page.$('.listing-buy-editonly')
      const sales = await page.evaluate(el => el.innerText, sold)
      assert(sales.replace(/\n/g, ' ') === 'Sold 2 Pending 0 Available 8')
    })

    it('should allow the edited listing to be purchased', async function() {
      await purchaseListing({ buyer })
    })

    it('should allow a new listing to be accepted', async function() {
      await acceptOffer({ seller })
    })

    it('should allow a new listing to be finalized', async function() {
      await finalizeOffer({ buyer })
    })
  })

  describe('Edit user profile', function() {
    before(async function() {
      ({ seller, buyer } = await reset())
      await changeAccount(page, seller)
    })

    it('should go to the profile page', async function() {
      await page.evaluate(() => {
        window.location = '/#/profile'
      })
      await pic(page, 'profile-page')
    })

    it('should open the edit modal', async function() {
      await clickBySelector(page, '.profile a.edit')
    })

    it('should enter new profile information', async function() {
      await page.waitForSelector('input[name=firstName]')
      await page.type('input[name=firstName]', 'Amerigo vespucci')
      await page.type('input[name=lastName]', 'Vespucci')
      await page.type(
        'textarea[name=description]',
        `In that hemisphere I have seen things not compatible with the opinions of philosophers.`
      )
      await pic(page, 'profile-edit-modal')
    })

    it('should close the edit modal', async function() {
      await clickByText(page, 'OK', 'button')
      await page.waitForSelector('.pl-modal', { hidden: true })
    })

    // it('should skip the wizard', async function() {
    //   if (await hasText(page, 'Skip', 'button')) {
    //     await clickByText(page, 'Skip', 'button')
    //   }
    // })

    it('should publish the profile changes', async function() {
      await pic(page, 'profile-before-publish')
      await clickByText(page, 'Publish Changes')
    })

    it('should reach a success page', async function() {
      await waitForText(page, 'Success')
      await pic(page, 'profile-edited')
      await clickByText(page, 'OK', 'button')
    })
  })
})
