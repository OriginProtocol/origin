const fetch = require('node-fetch')
const parser = require('fast-xml-parser')
const Xray = require('x-ray')
const x = Xray()

const uniq = require('lodash/uniq')
const get = require('lodash/get')

const getCollections = async shopifyUrl => {
  const sitemap = await fetch(`${shopifyUrl}/sitemap_collections_1.xml`)
  const sitemapXml = await sitemap.text()
  const sitemapJson = parser.parse(sitemapXml)

  const collections = []
  for (const urlElement of sitemapJson.urlset.url) {
    const collection = await getCollection(urlElement.loc)
    collections.push(collection)
  }

  return collections
}

const getCollection = async url => {
  let json
  try {
    json = await x(url, {
      title: 'h1',
      links: x('a', ['@href']).paginate('ul.pagination li:last-child a@href')
    })
  } catch (error) {
    console.log(error)
    return
  }
  const links = json.links.filter(i => i.indexOf(`${url}/`) === 0)
  const splitUrl = url.split('/')
  return {
    id: splitUrl[splitUrl.length - 1],
    title: json.title,
    products: uniq(links.map(link => link.replace(`${url}/data/`, '')))
  }
}

const getProducts = async shopifyUrl => {
  const sitemap = await fetch(`${shopifyUrl}/sitemap.xml`)
  const sitemapXml = await sitemap.text()
  const sitemapJson = parser.parse(sitemapXml)

  const productSitemap = await fetch(sitemapJson.sitemapindex.sitemap[0].loc)
  const productSitemapXml = await productSitemap.text()
  const productSitemapJson = parser.parse(productSitemapXml)
  const productUrls = productSitemapJson.urlset.url
    .map(p => p.loc)
    .filter(p => p.indexOf('/products') > 0)

  // return [await getProduct(productUrls[0])]
  return await Promise.all(productUrls.map(getProduct))
}

const getProduct = async productUrl => {
  let json = await x(productUrl, '#ProductJson-product-template')
  if (!json) {
    const pid = await x(productUrl, '.product-form@data-product-form')
    json = await x(productUrl, `script[data-product-json-${pid}]`)
  }

  const data = JSON.parse(json)

  // Shopify doesn't add a schema to image URLs, but it does for variant
  // featured images
  data.images = data.images.map(i => `https:${i}`)

  return {
    id: data.handle,
    title: data.title,
    description: data.description,
    price: data.price,
    available: true,
    options: data.options,
    images: data.images,
    image: data.images[0],
    variants: data.variants.map((variant, idx) => {
      return {
        id: idx,
        title: variant.title,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
        image: get(variant, 'featured_image.src'),
        available: variant.available,
        name: variant.name,
        options: variant.options,
        price: variant.price,
        weight: variant.weight
      }
    })
  }
}

const convertCollectionUrlsToIds = (collection, products) => {
  return {
    ...collection,
    products: collection.products
      .map(url => {
        const productIndex = products.findIndex(p =>
          url.split('/').includes(p.id)
        )
        return productIndex ? productIndex : null
      })
      .filter(id => id !== null)
  }
}

module.exports = {
  getCollections,
  getProducts,
  convertCollectionUrlsToIds
}
