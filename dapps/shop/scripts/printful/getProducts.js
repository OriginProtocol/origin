const fs = require('fs')
const fetch = require('node-fetch')

async function getProducts({ PrintfulURL, apiAuth, OutputDir }) {
  const res = await fetch(`${PrintfulURL}/sync/products?limit=100`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  console.log(`${OutputDir}/printful-products.json`)

  fs.writeFileSync(
    `${OutputDir}/printful-products.json`,
    JSON.stringify(json.result, null, 2)
  )

  console.log(`Synced ${json.result.length} products from Printful`)

  return json.result.map(d => d.id)
}

module.exports = getProducts
