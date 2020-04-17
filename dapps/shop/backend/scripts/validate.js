require('dotenv').config()
const fs = require('fs')
const { Order, Shop } = require('../models')
const flatten = require('lodash/flatten')

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

async function validate(dataDir) {
  let productIds
  try {
    const path = `${__dirname}/../../data/${dataDir}/products.json`
    const products = JSON.parse(fs.readFileSync(path))
    productIds = products.map(p => p.id)
  } catch (e) {
    /* Ignore */
  }
  if (!productIds.length) {
    console.log('Error reading products')
    return
  }

  const shop = await Shop.findOne({ where: { authToken: dataDir } })
  if (!shop) {
    console.log('No shop found')
    return
  }
  console.log(`Found shop ${shop.name} ${shop.networkId}`)

  const allOrders = await Order.findAll({ where: { shopId: shop.id } })
  console.log(`Found ${allOrders.length} orders`)

  const orders = allOrders
    .map(o => o.dataValues)
    .filter(o => o.ipfsHash)
    .map(o => JSON.parse(o.data))
    .filter(o => o.items)

  const orderProductIds = flatten(orders.map(o => o.items))
    .map(i => i.product)
    .filter(onlyUnique)

  orderProductIds.forEach(id => {
    if (productIds.indexOf(id) < 0) {
      console.log(`\nProduct ${id} not found in products.json`)
      orders
        .filter(o => {
          const item = o.items.find(i => i.product === id)
          return item ? true : false
        })
        .forEach(order => {
          console.log(`  Order ${order.offerId} for ${order.userInfo.email}`)
        })
    }
  })
}

const dataDir = process.argv[2]
if (!dataDir) {
  console.log('Usage: node validate [dataDir]')
  process.exit()
}

validate(dataDir)
