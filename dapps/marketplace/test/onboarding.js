import { getPage } from './utils/_services'
import {
  changeAccount,
  waitForText,
  clickByText
} from './utils/_puppeteerHelpers'

import { reset } from './utils/_actions'

export function onboardingTests() {
  describe('Complete onboarding', function() {
    let page
    before(async function() {
      this.timeout(10000)
      page = await getPage()
      const { seller, buyer } = await reset({
        page,
        sellerOpts: { ogn: '100' },
        reload: true
      })
      await page.evaluate(() => {
        localStorage.clear()
        window.location = '/#/'
      })
      await changeAccount(page, buyer)
      await changeAccount(page, seller, true)
    })

    it('should be redirected to onboarding page', async function() {
      this.timeout(8000)
      await page.evaluate(() => {
        window.location = '/#/profile'
      })

      await waitForText(page, 'Connect a Crypto Wallet')
    })

    it('should enable messaging', async function() {
      this.timeout(8000)
      await page.reload()
      await page.evaluate(() => {
        window.location = '/#/onboard/messaging'
      })

      await waitForText(page, '0 of 2 MetaMask messages signed')
      await clickByText(page, 'Enable Origin Messaging', 'button')

      await waitForText(
        page,
        'Congratulations! You can now message other users'
      )
      await clickByText(page, 'Continue', 'a')
    })
  })
}
