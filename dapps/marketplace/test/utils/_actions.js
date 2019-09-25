import assert from 'assert'

import {
  changeAccount,
  clearCookies,
  waitForText,
  clickByText,
  pic,
  createAccount,
  giveRating,
  waitUntilTextHides
} from './_puppeteerHelpers'

export async function reset({ page, sellerOpts, buyerOpts, reload = false }) {
  // clear cookies (for messaging)
  await clearCookies(page)

  await page.evaluate(reload => {
    window.transactionPoll = 100
    window.sessionStorage.clear()
    window.location = '/#/'
    /* Some tests require reload... e.g. to reset messaging
     * initialisation.
     */
    if (reload) {
      window.location.reload(true)
    }
  }, reload)

  if (reload) {
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
  }

  const seller = await createAccount(page, sellerOpts)
  const buyer = await createAccount(page, buyerOpts)

  return { buyer, seller }
}

export const purchaseListing = async ({
  page,
  buyer,
  withShipping,
  title,
  withToken
}) => {
  withToken = withToken || 'ETH'

  await pic(page, 'listing-detail')
  await changeAccount(page, buyer)

  await clickByText(page, 'Purchase', 'a')

  let totalValue
  switch (withToken) {
    case 'ETH':
      await clickByText(page, 'Ethereum')
      await waitForText(page, '0.00632 ETH')
      totalValue = '0.00632 ETH'
      break

    case 'DAI':
      await clickByText(page, 'Maker Dai')
      await waitForText(page, '1 DAI')
      totalValue = '1 DAI'
      break

    case 'OGN':
      await clickByText(page, 'Origin Token')
      await waitForText(page, '1 OGN')
      totalValue = '1 OGN'
      break
  }

  await clickByText(page, 'Continue', 'a')

  if (withShipping) {
    await page.waitForSelector('.shipping-address-form [name=name]')
    await page.type('.shipping-address-form [name=name]', 'Bruce Wayne')
    await page.type(
      '.shipping-address-form [name=address1]',
      '123 Wayne Towers'
    )
    await page.type('.shipping-address-form [name=city]', 'Gotham City')
    await page.type(
      '.shipping-address-form [name=stateProvinceRegion]',
      'New Jersey'
    )
    await page.type('.shipping-address-form [name=postalCode]', '123456')
    await page.type('.shipping-address-form [name=country]', 'USA')

    await clickByText(page, 'Continue', 'button')
  }

  // Purchase confirmation
  await waitForText(page, 'Please confirm your purchase', 'h1')
  await pic(page, 'purchase-confirmation')

  await waitForText(page, 'Total Price')

  const summaryEls = await page.$('.purchase-summary')
  const summaryText = (await page.evaluate(
    el => el.innerText || '',
    summaryEls
  )).replace(/[\n\t\r ]+/g, ' ')

  if (withShipping) {
    assert(
      summaryText ===
        `${title} Total Price $1 Payment ${totalValue} Shipping Address Bruce Wayne 123 Wayne Towers Gotham City New Jersey 123456 USA`,
      'Invalid Summary'
    )
  } else {
    assert(
      summaryText === `${title} Total Price $1 Payment ${totalValue}`,
      'Invalid Summary'
    )
  }

  await clickByText(page, 'Purchase', 'button')
}

export const purchaseMultiUnitListing = async ({
  page,
  buyer,
  withShipping,
  title,
  withToken
}) => {
  withToken = withToken || 'ETH'

  await pic(page, 'listing-detail')
  await changeAccount(page, buyer)
  await page.waitForSelector('.quantity select')
  await page.select('.quantity select', '2')

  await clickByText(page, 'Purchase', 'a')

  let totalValue
  switch (withToken) {
    case 'ETH':
      await clickByText(page, 'Ethereum')
      await waitForText(page, '0.01265 ETH')
      totalValue = '0.01265 ETH'
      break

    case 'DAI':
      await clickByText(page, 'Maker Dai')
      await waitForText(page, '2 DAI')
      totalValue = '2 DAI'
      break

    case 'OGN':
      await clickByText(page, 'Origin Token')
      await waitForText(page, '2 OGN')
      totalValue = '2 OGN'
      break
  }

  await clickByText(page, 'Continue', 'a')

  if (withShipping) {
    await page.waitForSelector('.shipping-address-form [name=name]')
    await page.type('.shipping-address-form [name=name]', 'Bruce Wayne')
    await page.type(
      '.shipping-address-form [name=address1]',
      '123 Wayne Towers'
    )
    await page.type('.shipping-address-form [name=city]', 'Gotham City')
    await page.type(
      '.shipping-address-form [name=stateProvinceRegion]',
      'New Jersey'
    )
    await page.type('.shipping-address-form [name=postalCode]', '123456')
    await page.type('.shipping-address-form [name=country]', 'USA')

    await clickByText(page, 'Continue', 'button')
  }

  // Purchase confirmation
  await waitForText(page, 'Please confirm your purchase', 'h1')
  await pic(page, 'purchase-confirmation')

  await waitForText(page, 'Total Price')

  const summaryEls = await page.$('.purchase-summary')
  const summaryText = (await page.evaluate(
    el => el.innerText || '',
    summaryEls
  )).replace(/[\n\t\r ]+/g, ' ')

  if (withShipping) {
    assert(
      summaryText ===
        `${title} Quantity 2 Total Price $2 Payment ${totalValue} Shipping Address Bruce Wayne 123 Wayne Towers Gotham City New Jersey 123456 USA`,
      'Invalid Summary'
    )
  } else {
    assert(
      summaryText ===
        `${title} Quantity 2 Total Price $2 Payment ${totalValue}`,
      'Invalid Summary'
    )
  }

  await clickByText(page, 'Purchase', 'button')
  await waitForText(page, 'View Purchase', 'button')
  await pic(page, 'purchase-listing')

  await clickByText(page, 'View Purchase', 'button')
  await waitForText(
    page,
    `You've made an offer. Wait for the seller to accept it.`
  )
  await pic(page, 'transaction-wait-for-seller')
}

export const purchaseFractionalListing = async ({ page, buyer }) => {
  await pic(page, 'listing-detail')
  await changeAccount(page, buyer)

  await clickByText(page, 'Availability', 'button')

  const startDay = await page.$(
    '.calendar:not(:first-child) .days .day:nth-child(9)'
  )
  const endDay = await page.$(
    '.calendar:not(:first-child) .days .day:nth-child(15)'
  )
  await startDay.click()
  await endDay.click()

  await clickByText(page, 'Save', 'button')

  await waitUntilTextHides(page, 'Save', 'button')

  await waitForText(page, 'Total Price')

  await clickByText(page, 'Book')

  await clickByText(page, 'Ethereum')

  await clickByText(page, 'Continue', 'a')

  // Purchase confirmation
  await waitForText(page, 'Please confirm your purchase', 'h1')
  await pic(page, 'purchase-confirmation')

  await waitForText(page, 'Total Price')

  // TODO: Find a way to verify check in and check out dates in summary

  await waitForText(page, 'Check In')
  await waitForText(page, 'Check Out')

  await clickByText(page, 'Book', 'button')

  await waitForText(page, 'View Purchase Details', 'button')
  await pic(page, 'purchase-listing')

  await clickByText(page, 'View Purchase Details', 'button')
  await waitForText(page, 'Transaction History')
  await pic(page, 'transaction-wait-for-seller')
}

export const acceptOffer = async ({ page, seller }) => {
  await changeAccount(page, seller)
  await waitForText(page, 'Accept Offer', 'button')
  await pic(page, 'transaction-accept')

  await clickByText(page, 'Accept Offer', 'button')
  await clickByText(page, 'OK', 'button')
  await waitForText(page, `You've accepted this offer`)
  await pic(page, 'transaction-accepted')
}

export const confirmReleaseFundsAndRate = async ({ page, buyer, review }) => {
  await changeAccount(page, buyer)
  await waitForText(page, 'Seller has accepted your offer.')
  await pic(page, 'transaction-confirm')
  await clickByText(page, 'Confirm receipt', 'button')
  await waitForText(page, 'Release the funds to the seller.')
  await pic(page, 'transaction-release-funds')
  await clickByText(page, 'Release Funds', 'button')
  await pic(page, 'transaction-release-funds-confirmation')
  await clickByText(page, 'Yes, please', 'button')
  await waitForText(page, 'Success!')
  await clickByText(page, 'OK', 'button')
  await waitForText(page, 'Leave a review of the seller')
  await giveRating(page, 3)
  if (review) {
    await page.type('textarea', review)
  }
  await pic(page, 'transaction-release-funds-rated')
  await clickByText(page, 'Submit', 'button')
  await waitForText(page, 'Success!')
  await clickByText(page, 'OK', 'button')
  await waitForText(page, 'Your purchase is complete.')
  await pic(page, 'transaction-release-funds-finalized')
}
