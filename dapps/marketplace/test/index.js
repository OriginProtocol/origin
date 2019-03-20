const puppeteer = require('puppeteer')

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`)
  return `concat('${splitedQuotes}', '')`
}

const clickByText = async (page, text, path) => {
  const escapedText = escapeXpathString(text)
  const xpath = `//${path || '*'}[contains(text(), ${escapedText})]`
  await page.waitForXPath(xpath)

  const linkHandlers = await page.$x(xpath)

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click()
  } else {
    throw new Error(`Link not found: ${text}`)
  }
}

const changeAccount = async (page, account) => {
  await page.evaluate(account => {
    window.localStorage.useWeb3Wallet = account
  }, account)
}

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 1024
    },
    slowMo: 40
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/test')
  await changeAccount(page, '0xf17f52151EbEF6C7334FAD080c5704D77216b732')
  await clickByText(page, 'Add Listing')
  await clickByText(page, 'For Sale')
  await page.select('select', 'schema.clothingAccessories')
  await clickByText(page, 'Continue')
  await page.type('input[name=title]', 'T-Shirt')
  await page.type('textarea[name=description]', 'T-Shirt in size large')
  await page.type('input[name=price]', '0.01')
  await clickByText(page, 'Continue')
  await clickByText(page, 'Review')
  await clickByText(page, 'Done')
  await clickByText(page, 'View Listing')
  await changeAccount(page, '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef')
  await clickByText(page, 'Purchase')
  await clickByText(page, 'View Purchase')
  await new Promise(resolve => setTimeout(resolve, 5000))

  await browser.close()
})()
