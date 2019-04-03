export const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`)
  return `concat('${splitedQuotes}', '')`
}

export const waitForText = async (page, text, path) => {
  const escapedText = escapeXpathString(text)
  const xpath = `/html/body//${path || '*'}[contains(text(), ${escapedText})]`
  await page.waitForXPath(xpath)
  return xpath
}

export const clickByText = async (page, text, path) => {
  const xpath = await waitForText(page, text, path)

  const linkHandlers = await page.$x(xpath)

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click()
  } else {
    throw new Error(`Link not found: ${text}`)
  }
}

export const changeAccount = async (page, account) => {
  if (account === 'seller') {
    account = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
  } else if (account === 'buyer') {
    account = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'
  }
  await page.evaluate(account => {
    window.localStorage.useWeb3Wallet = account
  }, account)
}

let screenshots = 0
export const pic = async (page, name) => {
  screenshots++
  await page.screenshot({
    path: `test/screenshots/${String(screenshots).padStart(3, '0')}-${name}.png`,
    fullPage: true
  })
}
