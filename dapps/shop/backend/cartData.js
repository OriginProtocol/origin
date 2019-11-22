const fetch = require('node-fetch')
const config = require('./config')()

async function fetchItem(item) {
  const url = `${config.siteData.productUrl}${item.product}/data.json`
  const dataRaw = await fetch(url)
  const data = await dataRaw.json()
  return {
    ...item,
    product: data,
    variant: data.variants.find(v => v.id === item.variant)
  }
}

async function fetchItems(items) {
  return await Promise.all(items.map(i => fetchItem(i)))
}

module.exports = fetchItems
