const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')

const { titleToId } = require('../util')

/**
 * Get the data_url as defined in the <link rel="data-dir"> tag
 */
const fetchDataDir = async dshopUrl => {
  let target = null

  const req = new Request(dshopUrl)
  const res = await fetch(req)
  if (!res.ok) return null

  const htmlString = await res.text()
  const htmlDOM = new JSDOM(htmlString)

  // iterate link tags looking for what we want
  const head = htmlDOM.window.document.head
  if (!head) return target

  for (const node of head.childNodes) {
    if (node && node.rel && node.rel === 'data-dir') {
      target = node.href
    }
  }

  return target
}

const getConfig = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/config.json`)
  const configJson = JSON.parse(await response.text())
  configJson.logo = `${dshopDataUrl}/${configJson.logo}`
  return configJson
}

const getCollections = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/collections.json`)
  return JSON.parse(await response.text())
}

const getProducts = async dshopDataUrl => {
  const response = await fetch(`${dshopDataUrl}/products.json`)
  let products = JSON.parse(await response.text())
  products = await Promise.all(
    products.map(async p => {
      // Get the full JSON for the product
      const id = titleToId(p.title)
      const productUrl = `${dshopDataUrl}/${id}`
      const response = await fetch(`${productUrl}/data.json`)

      let fullProductData
      try {
        fullProductData = JSON.parse(await response.text())
      } catch (error) {
        console.warn('Could not fetch data for', productUrl)
        return null
      }

      // Make the images absolute URLs
      fullProductData.images = fullProductData.images.map(
        i => `${productUrl}/orig/${i}`
      )
      fullProductData.image = `${productUrl}/orig/${fullProductData.image}`
      fullProductData.variants.map(v => {
        return {
          ...v,
          image: `${productUrl}/orig/${v.image}`
        }
      })

      return fullProductData
    })
  )
  return products.filter(p => p !== null)
}

const convertCollectionIdsToIndices = (collection, products) => {
  return {
    ...collection,
    products: collection.products
      .map(id => {
        return products.findIndex(p => p.id === id)
      })
      .filter(id => id !== null)
  }
}

module.exports = {
  fetchDataDir,
  getConfig,
  getCollections,
  getProducts,
  convertCollectionIdsToIndices
}
