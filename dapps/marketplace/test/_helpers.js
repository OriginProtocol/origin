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
  await page.evaluate(account => {
    window.localStorage.useWeb3Wallet = account
  }, account)
}

export const createAccount = async page => {
  return await page.evaluate(
    () =>
      new Promise(resolve =>
        window.ognTools.createAccount(window.gql).then(resolve)
      )
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
