const fetch = require('node-fetch')
const cheerio = require('cheerio')

const Xray = require('x-ray')
const x = Xray()
const fs = require('fs')
const uniq = require('lodash/uniq')

const outputDir = `${__dirname}/output`

// const StoreURL = 'https://store.gitcoin.co'
// const StoreURL = 'https://swag.ethereum.org'
// const StoreURL = 'https://shop.ethhub.io'
const StoreURL = 'https://store.brave.com'

async function getCollections() {
  console.log('Fetching collections...')
  const sitemap = await fetch(`${StoreURL}/sitemap_collections_1.xml`)
  const sitemapXml = await sitemap.text()
  const $sitemap = cheerio.load(sitemapXml, { xmlMode: true })

  const collectionUrls = $sitemap('urlset url loc')
    .map((idx, el) => cheerio(el).text())
    .get()

  const collections = []
  for (const url of collectionUrls) {
    console.log(`Fetching ${url}`)
    const json = await x(url, {
      title: 'h1',
      links: x('a', ['@href']).paginate('ul.pagination li:last-child a@href')
    })
    const links = json.links.filter(i => i.indexOf(`${url}/`) === 0)
    const splitUrl = url.split('/')
    collections.push({
      id: splitUrl[splitUrl.length - 1],
      title: json.title,
      products: uniq(links.map(link => link.replace(`${url}/products/`, '')))
    })
  }

  fs.writeFileSync(
    `${outputDir}/collections.json`,
    JSON.stringify(collections, null, 4)
  )
}

async function getProductURLs() {
  console.log('Fetching product URLs...')
  const sitemap = await fetch(`${StoreURL}/sitemap.xml`)
  const sitemapXml = await sitemap.text()
  const $sitemap = cheerio.load(sitemapXml, { xmlMode: true })

  const productMapUrl = $sitemap('sitemapindex sitemap loc')
    .first()
    .text()

  const productsSitemap = await fetch(productMapUrl)
  const productsXml = await productsSitemap.text()
  const $products = cheerio.load(productsXml, { xmlMode: true })

  const products = []
  $products('urlset url').map((i, el) => {
    const productUrl = $products(el).find('loc')
    products.push(productUrl.text())
  })

  return products.filter(p => p.indexOf('/products/') > 0)
}

async function fetchProductJson(urls) {
  fs.mkdirSync(`${__dirname}/output/products-raw`, { recursive: true })
  for (const url of urls) {
    try {
      let json = await x(url, '#ProductJson-product-template')

      if (!json) {
        const pid = await x(url, '.product-form@data-product-form')
        json = await x(url, `script[data-product-json-${pid}]`)
      }
      const data = JSON.parse(json)
      const formatted = JSON.stringify(data, null, 4)
      fs.writeFileSync(
        `${__dirname}/output/products-raw/${data.handle}.json`,
        formatted
      )
      console.log(`Got product ${data.handle}`)
      // await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (e) {
      console.log(`Error fetching ${url}`)
      console.log(e)
    }
  }
}

async function processProducts() {
  const productIndex = []
  const images = []
  const imageMap = {}
  const items = fs.readdirSync(`${outputDir}/products-raw`)

  for (const item of items) {
    const json = fs.readFileSync(`${outputDir}/products-raw/${item}`)
    const data = JSON.parse(json)
    data.images.forEach((image, idx) => {
      const split = image.split('/')
      const extSplit = split[split.length - 1].split('?')[0].split('.')
      const ext = extSplit[extSplit.length - 1].toLowerCase()
      const file = `img-${idx}.${ext}`
      const filename = `products/${data.handle}/orig/${file}`
      imageMap[image] = file
      images.push(`curl "https:${image}" --create-dirs -o ${filename} `)
    })
    productIndex.push({
      id: data.handle,
      title: data.title,
      price: data.price,
      image: imageMap[data.images[0]]
    })
    const productDir = `${outputDir}/products/${data.handle}`
    fs.mkdirSync(productDir, { recursive: true })
    fs.writeFileSync(
      `${productDir}/data.json`,
      JSON.stringify(scrub(data, imageMap), null, 4)
    )
  }
  fs.writeFileSync(
    `${outputDir}/products.json`,
    JSON.stringify(productIndex, null, 4)
  )
  fs.writeFileSync(`${outputDir}/download-images.sh`, uniq(images).join('\n'))
  fs.writeFileSync(
    `${outputDir}/convert-images.sh`,
    `
find products -type dir | grep '\\/orig' | sed 's/orig$/520/' | xargs mkdir -p
find products -type f | grep '\\/orig\\/' | awk '{ printf "convert " $1 " -resize 520x520 "; gsub(/\\/orig\\//, "/520/", $1); printf $1; printf "\\n" }' > conv.sh`
  )
}

function scrub(data, imageMap) {
  return {
    id: data.handle,
    title: data.title,
    description: data.description,
    price: data.price,
    available: true,
    options: data.options,
    images: data.images.map(i => imageMap[i]),
    image: imageMap[data.images[0]],
    variants: data.variants.map((variant, idx) => {
      let image
      if (variant.featured_image) {
        const src = variant.featured_image.src || ''
        image = imageMap[src.replace(/^https:/, '')]
        if (!image) {
          console.log(data.handle, idx, 'no image')
        }
      }
      return {
        id: idx,
        title: variant.title,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
        image,
        available: variant.available,
        name: variant.name,
        options: variant.options,
        price: variant.price,
        weight: variant.weight
      }
    })
  }
}

async function start() {
  const productUrls = await getProductURLs()
  await fetchProductJson(productUrls)
  await processProducts()
  await getCollections()
}

start()
