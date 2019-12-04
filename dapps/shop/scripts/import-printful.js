/* eslint-disable */

require('dotenv').config()
const fetch = require('node-fetch')
const program = require('commander')
const fs = require('fs')

program.requiredOption('-s, --site <site>', 'Site name')

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)

const OutputDir = `${__dirname}/output/${program.site}`

const apiAuth = Buffer.from(process.env.PRINTFUL).toString('base64')
const PrintfulURL = 'https://api.printful.com'

async function getProducts() {
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

async function getProduct(id) {
  const res = await fetch(`${PrintfulURL}/sync/products/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  const data = json.result

  fs.writeFileSync(
    `${OutputDir}/data-printful/product-${id}.json`,
    JSON.stringify(data, null, 2)
  )
  console.log(`Wrote product ${id}`)

  return
}

async function getProductIds() {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw)
  return products.map(p => p.id)
}
async function getProductSyncIds(id) {
  const productRaw = fs.readFileSync(
    `${OutputDir}/data-printful/product-${id}.json`
  )
  const product = JSON.parse(productRaw)
  return product.sync_variants.reduce((m, o) => {
    m[o.external_id] = o.id
    return m
  }, {})
}

async function downloadProductData() {
  await getProducts()
  fs.mkdirSync(`${OutputDir}/data-printful`, { recursive: true })
  const ids = await getProductIds()
  for (const id of ids) {
    await getProduct(id)
  }
}

async function writeShopifyToPrintful() {
  const ids = await getProductIds()

  let syncIds = {}
  for (const id of ids) {
    const productSyncIds = await getProductSyncIds(id)
    syncIds = { ...syncIds, ...productSyncIds }
  }
  fs.writeFileSync(
    `${OutputDir}/shopify-printful.json`,
    JSON.stringify(syncIds, null, 2)
  )
}

async function writePrintfulIds() {
  const shopifyIdsRaw = fs.readFileSync(`${OutputDir}/shopify-ids.json`)
  const shopifyIds = JSON.parse(shopifyIdsRaw)

  const shopifyPrintfulRaw = fs.readFileSync(
    `${OutputDir}/shopify-printful.json`
  )
  const shopifyPrintful = JSON.parse(shopifyPrintfulRaw)

  const printfulIds = Object.keys(shopifyIds).reduce((m, o) => {
    m[o] = shopifyIds[o].variants.map(v => shopifyPrintful[String(v)])
    return m
  }, {})

  fs.writeFileSync(
    `${OutputDir}/printful-ids.json`,
    JSON.stringify(printfulIds, null, 2)
  )
}

async function start() {
  await downloadProductData()
  // await writeShopifyToPrintful()
  // await writePrintfulIds()
}

start()
