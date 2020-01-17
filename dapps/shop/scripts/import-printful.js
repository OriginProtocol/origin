require('dotenv').config()
const program = require('commander')
const fs = require('fs')

const getProducts = require('./printful/getProducts')
const getProduct = require('./printful/getProduct')
const getVariant = require('./printful/getVariant')
const writeProductData = require('./printful/writeProductData')

program.requiredOption('-s, --site <site>', 'Site name')

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)

const OutputDir = `${__dirname}/output/${program.site}`

const apiAuth = Buffer.from(process.env.PRINTFUL).toString('base64')
const PrintfulURL = 'https://api.printful.com'

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
  await getProducts({ PrintfulURL, apiAuth, OutputDir })
  fs.mkdirSync(`${OutputDir}/data-printful`, { recursive: true })
  const ids = await getProductIds()
  for (const id of ids) {
    await getProduct({ PrintfulURL, apiAuth, OutputDir, id })
  }
}

async function downloadVariantData() {
  const ids = await getProductIds()
  for (const id of ids) {
    const productDataRaw = fs.readFileSync(
      `${OutputDir}/data-printful/product-${id}.json`
    )
    const productData = JSON.parse(productDataRaw)
    console.log(productData.sync_variants[0].product.variant_id)
    const firstVariantId = productData.sync_variants[0].product.variant_id
    await getVariant({ PrintfulURL, apiAuth, OutputDir, id: firstVariantId })
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
  // await downloadProductData()
  // await writeShopifyToPrintful()
  // await writePrintfulIds()
  await writeProductData({ OutputDir })
  // await writeInternalData()
  // await getMockups('151902453')
  // await downloadVariantData()
}

start()
