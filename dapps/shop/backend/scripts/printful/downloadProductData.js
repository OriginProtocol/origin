const fs = require('fs')

const getProducts = require('./getProducts')
const getProduct = require('./getProduct')
const getProductIds = require('./getProductIds')

async function downloadProductData({ OutputDir, PrintfulURL, apiAuth }) {
  fs.mkdirSync(`${OutputDir}/data-printful`, { recursive: true })
  await getProducts({ PrintfulURL, apiAuth, OutputDir })
  const ids = await getProductIds({ OutputDir })
  for (const id of ids) {
    await getProduct({ PrintfulURL, apiAuth, OutputDir, id })
  }
}

module.exports = downloadProductData
