const fs = require('fs')
const { get } = require('./_api')

const getSizeGuide = require('./getSizeGuide')

async function getProduct({ apiAuth, OutputDir, id }) {
  const syncPath = `${OutputDir}/data-printful/sync-product-${id}.json`
  const json = await get(`/sync/products/${id}`, { auth: apiAuth })
  fs.writeFileSync(syncPath, JSON.stringify(json.result, null, 2))

  const productId = json.result.sync_variants[0].product.product_id
  const productPath = `${OutputDir}/data-printful/product-${productId}.json`

  if (!fs.existsSync(productPath)) {
    const productJson = await get(`/products/${productId}`, { auth: apiAuth })
    const result = productJson.result
    const sizeGuide = await getSizeGuide({ OutputDir, productId })
    result.sizeGuide = sizeGuide
    fs.writeFileSync(productPath, JSON.stringify(result, null, 2))

    const sg = sizeGuide ? ' + size guide' : ''
    console.log(`Wrote sync product ${id}, product ${productId}${sg}`)
  } else {
    console.log(`Wrote sync product ${id}`)
  }
}

module.exports = getProduct
