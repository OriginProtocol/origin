// import enUSRaw from '../public/translations/en_US.json'
// import zhCNRaw from '../public/translations/zh_CN.json'
//
// function trans(raw) {
//   const output = {}
//   Object.keys(raw).forEach(k => {
//     if (typeof raw[k] === 'object') {
//       Object.keys(enUSRaw[k]).forEach(subKey => {
//         output[`${k}${subKey}`] = raw[k][subKey]
//       })
//     } else {
//       output[k] = raw[k]
//     }
//   })
//   return output
// }

// const enUS = trans(enUSRaw),
//   zhCN = trans(zhCNRaw)

export const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`)
  return `concat('${splitedQuotes}', '')`
}

export const clickXpath = async (page, xpath, linkName) => {
  const linkHandlers = await page.$x(xpath)

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click()
  } else {
    throw new Error(`Link not found: ${linkName || xpath}`)
  }
}

export const waitForText = async (page, text, path) => {
  // const hash = Object.keys(enUS).find(key => enUS[key] === text)
  // if (zhCN[hash]) {
  //   text = zhCN[hash]
  // }
  // else {
  //   console.log('Could not find', text)
  // }
  const escapedText = escapeXpathString(text)
  const xpath = `/html/body//${path || '*'}[contains(text(), ${escapedText})]`
  await page.waitForXPath(xpath)
  return xpath
}

export const hasText = async (page, text, path) => {
  const escapedText = escapeXpathString(text)
  const xpath = `/html/body//${path || '*'}[contains(text(), ${escapedText})]`
  const result = await page.$x(xpath)
  return result ? true : false
}

export const clearCookies = async (page) => {
  await page._client.send('Network.clearBrowserCookies')
}

export const clickByText = async (page, text, path) => {
  const xpath = await waitForText(page, text, path)

  await clickXpath(page, xpath, text)
}

export const waitForElementWithClassName = async (page, className, path) => {
  const xpath = `/html/body//${path || '*'}[contains(@class, '${className}')]`
  await page.waitForXPath(xpath)
  return xpath
}

export const giveRating = async (page, rating) => {
  let xpath = await waitForElementWithClassName(page, 'star-rating')
  xpath = `${xpath}/div[position()=${rating}]`
  await clickXpath(page, xpath, `.star-rating(${rating})`)
}

export const clickBySelector = async (page, path) => {
  await page.waitForSelector(path)
  const linkHandler = await page.$(path)
  if (linkHandler) {
    await linkHandler.click()
  } else {
    throw new Error(`Link not found: ${path}`)
  }
}

export const changeAccount = async (page, account, isFreshAccount = false) => {
  await page.evaluate(({ account, isFreshAccount }) => {
    window.localStorage.useWeb3Wallet = account
    const accountData = {
      id: account,
      profile: {
        firstName: 'Test',
        lastName: 'Account',
        description: '',
        avatar: ''
      },
      attestations: [],
      strength: 0
    }
    window.localStorage.useWeb3Identity = isFreshAccount ? null : JSON.stringify(accountData)
  }, { account, isFreshAccount })
}

export const createAccount = async (page, ogn) => {
  return await page.evaluate(
    ogn =>
      new Promise(resolve =>
        window.ognTools.createAccount(window.gql, ogn).then(resolve)
      ),
    ogn
  )
}

const shouldScreenshot = process.env.SCREENSHOTS ? true : false
let screenshots = 0
export const pic = async (page, name) => {
  if (!shouldScreenshot) return
  screenshots++
  await page.screenshot({
    path: `test/screenshots/${String(screenshots).padStart(
      3,
      '0'
    )}-${name}.png`,
    fullPage: true
  })
}
