export const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`)
  return `concat('${splitedQuotes}', '')`
}

export const clickByText = async (page, text, path) => {
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

export const changeAccount = async (page, account) => {
  await page.evaluate(account => {
    window.localStorage.useWeb3Wallet = account
  }, account)
}
