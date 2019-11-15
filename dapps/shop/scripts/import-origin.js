/**
 * Convert a user's listings on Origin to Store format
 */

const fs = require('fs')
const fetch = require('node-fetch')
const get = require('lodash/get')
const uniq = require('lodash/uniq')
const uniqBy = require('lodash/uniqBy')

// const UserID = '0x334B9DE442bca03C07c1AC5bb86FcDfEdB108275' // Origin
// const UserID = '0x5CA06BBeBe6e981abdD3C7147F173BfeC23265c7' // Tripps
const UserID = '0x522731a061e896B5Db9dDff9234fB5461A533710' // Origin Store

const Allowed = `origin-pullover-hoodie
baseball-cap
origin-backpack
origin-sticker
light-blue-origin-t-shirt
origin-popsocket
astronaut-t-shirt
origin-coffee-mug
origin-t-shirt
origin-tote-bag
origin-crewneck-sweatshirt
leather-iphone-book-wallet
dipping-sauce-holder-for-cars
pokemon-planter
concrete-usb-drive-128-gb
origin-shirt
origin-hodl-shirt
origin-sweatshirt
iphone-phone-case
origin-logo-beanie
rocket-coffee-mug
robot-tote-bag
cryptouni-pillow
to-the-moon-sketch-hoodie
cut-out-the-middleman-baseball-tee
samsung-galaxy-phone-case
women-s-astro-shirt
women-s-origin-soma-sweatshirt
women-s-flower-crop-hoodie
origin-vintage-cap
origin-universe-t-shirt
origin-unicorn-shirt
origin-socks
origin-rocketman-unisex-hoodie
origin-logo-tee
all-over-print-athletic-shorts
galaxy-s10-s10-s10e-phone-case
origin-reddit-shirt`.split('\n')

const outputDir = `${__dirname}/output-origin`

async function getProductData() {
  fetch('https://graphql.originprotocol.com/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: `{"operationName":null,"variables":{},"query":"{\\n  marketplace {\\n    user(id: \\"${UserID}\\") {\\n      listings(first: 1000) {\\n        nodes {\\n          ... on Listing {\\n            id\\n            title\\n            description\\n            media {\\n              urlExpanded\\n            }\\n            price {\\n              currency {\\n                ... on Currency {\\n                  id\\n                  __typename\\n                }\\n                __typename\\n              }\\n              amount\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n      }\\n    }\\n  }\\n}\\n"}`
  }).then(async res => {
    const json = await res.json()
    const products = JSON.stringify(
      uniqBy(get(json, 'data.marketplace.user.listings.nodes'), 'id'),
      null,
      4
    )
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(outputDir + '/products-raw.json', products)
  })
}

function getPrice(data) {
  if (get(data, 'price.currency.id') === 'fiat-USD') {
    return Number(get(data, 'price.amount')) * 100
  }
  return Number(get(data, 'price.amount')) * 18500
}

async function processProducts() {
  const productIndex = []
  const images = []
  const imageMap = {}
  const items = JSON.parse(fs.readFileSync(`${outputDir}/products-raw.json`))

  for (const data of items) {
    data.handle = data.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '')
    if (!data.handle || data.handle === '-') {
      const splitId = data.id.split('-')
      data.handle = `listing-${splitId[splitId.length - 1]}`
    }

    if (Allowed.indexOf(data.handle) < 0) {
      continue
    }

    data.media.forEach((image, idx) => {
      const file = `img-${idx}.png`
      const filename = `products/${data.handle}/orig/${file}`
      imageMap[image.urlExpanded] = file
      images.push(`curl "${image.urlExpanded}" --create-dirs -o ${filename} `)
    })

    productIndex.push({
      id: data.handle,
      title: data.title,
      price: getPrice(data),
      image: 'img-0.png'
    })
    const productDir = `${outputDir}/products/${data.handle}`
    fs.mkdirSync(productDir, { recursive: true })
    fs.writeFileSync(
      `${productDir}/data.json`,
      JSON.stringify(scrub(data, imageMap), null, 4)
    )
  }
  fs.writeFileSync(
    `${outputDir}/products/products.json`,
    JSON.stringify(uniqBy(productIndex, 'id'), null, 4)
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
    price: getPrice(data),
    available: true,
    images: data.media.map(i => imageMap[i.urlExpanded]),
    image: imageMap[data.media[0].urlExpanded],
    variants: [
      {
        id: 0,
        title: data.title,
        option1: null,
        option2: null,
        option3: null,
        image: imageMap[data.media[0].urlExpanded],
        available: true,
        name: data.title,
        options: [],
        price: getPrice(data)
      }
    ]
  }
}

// getProductData()
processProducts()
