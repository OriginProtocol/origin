const fetch = require('node-fetch')

const getConfig = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/config.json`)
  return JSON.parse(response.text())
}

// TODO
const getCollections = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/collections.json`)
  console.log(response)
  // Convert from product id to bare index
}

// TODO
const getProducts = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/products.json`)
  console.log(response)
  // Convert images from filenames to absolute URLs
}

module.exports = {
  getConfig,
  getCollections,
  getProducts
}
