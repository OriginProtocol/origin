const fs = require('fs')
const { get } = require('./_api')

async function getProduct({ apiAuth, OutputDir, id }) {
  const syncPath = `${OutputDir}/data-printful/sync-product-${id}.json`
  const json = await get(`/sync/products/${id}`, { auth: apiAuth })
  fs.writeFileSync(syncPath, JSON.stringify(json.result, null, 2))

  const productId = json.result.sync_variants[0].product.product_id
  const productPath = `${OutputDir}/data-printful/product-${productId}.json`
  const productJson = await get(`/products/${productId}`, { auth: apiAuth })
  fs.writeFileSync(productPath, JSON.stringify(productJson.result, null, 2))

  console.log(`Wrote sync product ${id}, product ${productId}`)
}

module.exports = getProduct
