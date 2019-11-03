import { getPage } from './utils/_services'

import {
  changeAccount,
  waitForText,
  clickByText,
  clickBySelector,
  pic
} from './utils/_puppeteerHelpers'

import { reset } from './utils/_actions'

export function userProfileTests(centralizedIdentity = false) {
  describe('Edit user profile', function() {
    let page
    before(async function() {
      page = await getPage()
      if (centralizedIdentity) {
        // If centralized identity is being tested, set the local
        // storage flag before running the tests.
        // We can't rely on the higher level test setup to have set this
        // flag since the DApp clears local storage during its initialization.
        await page.evaluate(() => {
          window.localStorage.centralizedIdentityEnabled = true
        })
      }
      const buyerOpts = { centralizedIdentity }
      const sellerOpts = { centralizedIdentity }
      const { seller } = await reset({ page, buyerOpts, sellerOpts })
      await changeAccount(page, seller)
    })

    it('should go to the profile page', async function() {
      await page.evaluate(() => {
        window.location = '/#/profile'
      })
      await pic(page, 'profile-page')
    })

    it('should open the edit modal', async function() {
      await clickBySelector(page, '.profile-page .profile-edit-icon')
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
      await clickByText(page, 'Save', 'button')
      await page.waitForSelector('.pl-modal', { hidden: true })
    })

    it('should reach a success page', async function() {
      await waitForText(page, 'Profile updated')
      await pic(page, 'profile-edited')
    })
  })
}
