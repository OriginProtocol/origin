const fs = require('fs')
const { get } = require('./_api')

async function getProducts({ apiAuth, OutputDir }) {
  const json = await get(`/sync/products?limit=100`, { auth: apiAuth })
  console.log(`${OutputDir}/printful-products.json`)

  fs.writeFileSync(
    `${OutputDir}/printful-products.json`,
    JSON.stringify(json.result, null, 2)
  )

  console.log(`Synced ${json.result.length} products from Printful`)

  return json.result.map(d => d.id)
}

module.exports = getProducts
