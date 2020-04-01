const fs = require('fs')

async function getProductIds({ OutputDir }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw)
  return products.map(p => p.id)
}

module.exports = getProductIds
