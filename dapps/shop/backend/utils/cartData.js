const fetch = require('node-fetch')

async function fetchItem(dataURL, item) {
  const url = `${dataURL}${item.product}/data.json`
  const dataRaw = await fetch(url)
  const data = await dataRaw.json()
  return {
    ...item,
    product: data,
    variant: data.variants.find(v => v.id === item.variant)
  }
}

async function fetchItems(dataURL, items) {
  return await Promise.all(items.map(i => fetchItem(dataURL, i)))
}

module.exports = fetchItems
