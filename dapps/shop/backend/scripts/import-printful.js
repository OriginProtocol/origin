/* eslint-disable */

require('dotenv').config()
const program = require('commander')
const fs = require('fs')
const https = require('https')
const sharp = require('sharp')

const getProducts = require('./printful/getProducts')
const getProduct = require('./printful/getProduct')
const getVariant = require('./printful/getVariant')
const getMockups = require('./printful/getMockups')
const downloadProductData = require('./printful/downloadProductData')
const downloadVariantData = require('./printful/downloadVariantData')
const downloadPrintfulMockups = require('./printful/downloadPrintfulMockups')
const resizePrintfulMockups = require('./printful/resizePrintfulMockups')
const getProductIds = require('./printful/getProductIds')
const writeProductData = require('./printful/writeProductData')
const writeInternalData = require('./printful/writeInternalData')

program.requiredOption('-s, --site <site>', 'Site name')

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)

const OutputDir = `${__dirname}/output/${program.site}`

const apiAuth = Buffer.from(process.env.PRINTFUL).toString('base64')
const PrintfulURL = 'https://api.printful.com'

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

async function writeShopifyToPrintful() {
  const ids = await getProductIds({ OutputDir })

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


async function matchPrintfulToExisting({ OutputDir }) {
  console.log('Matching Printful products...')
  const printfulProductsRaw = fs.readFileSync(
    `${OutputDir}/printful-products.json`
  )
  const printfulProducts = JSON.parse(printfulProductsRaw)
  const productsRaw = fs.readFileSync(`${OutputDir}/data/products.json`)
  const products = JSON.parse(productsRaw)
  const printfulIds = {}
  for (const printfulProduct of printfulProducts) {
    console.log(`Printful product: ${printfulProduct.name}`)
    const product = products.find(p => p.title === printfulProduct.name)
    if (product) {
      console.log(`✅ Found product ${product.title}`)
      const ppRaw = fs.readFileSync(
        `${OutputDir}/data-printful/product-${printfulProduct.id}.json`
      )
      const pp = JSON.parse(ppRaw)
      const dRaw = fs.readFileSync(`${OutputDir}/data/${product.id}/data.json`)
      const d = JSON.parse(dRaw)
      if (pp.sync_variants.length !== d.variants.length) {
        console.log(
          `❌ Sync variants don't match. (Printful: ${pp.sync_variants.length}, Local: ${d.variants.length})`
        )
      } else {
        for (var i = 0; i < d.variants.length; i++) {
          const opts = d.variants[i].options.filter(o => o)
          const pVariant = pp.sync_variants[i]
          console.log(
            `${opts.join(', ')} - ${pVariant.name.replace(
              `${printfulProduct.name} - `,
              ''
            )}`
          )
        }
        printfulIds[d.id] = pp.sync_variants.map(s => s.id)
      }
    } else {
      console.log('❌ No corresponding product found.')
    }
    console.log('')
  }
  fs.writeFileSync(
    `${OutputDir}/data/printful-ids.json`,
    JSON.stringify(printfulIds, null, 2)
  )
}

async function start() {
  // await downloadProductData({ OutputDir, PrintfulURL, apiAuth })
  // await downloadVariantData({ OutputDir, PrintfulURL, apiAuth })
  await writeProductData({ OutputDir })
  // await downloadPrintfulMockups({ OutputDir })
  // await resizePrintfulMockups({ OutputDir })

  // await matchPrintfulToExisting({ OutputDir })
  // await writeInternalData({ OutputDir })
  // await getMockups({ PrintfulURL, apiAuth, OutputDir, id: '153402138' })
  // await writeShopifyToPrintful()
  // await writePrintfulIds()
}

start()
