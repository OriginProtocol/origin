const omit = require('lodash/omit')
const { Seller, Shop, SellerShop } = require('../models')
const { authSellerAndShop, authRole } = require('./_auth')
const { createSeller } = require('../utils/sellers')
const encConf = require('../utils/encryptedConfig')
const encryptedConfig = require('../utils/encryptedConfig')
const { createShop } = require('../utils/shop')
const get = require('lodash/get')
const fs = require('fs')
const os = require('os')
const configs = require('../scripts/configs')
const deploy = require('ipfs-deploy')
const { exec } = require('child_process')

const downloadProductData = require('../scripts/printful/downloadProductData')
const downloadPrintfulMockups = require('../scripts/printful/downloadPrintfulMockups')
const resizePrintfulMockups = require('../scripts/printful/resizePrintfulMockups')
const writeProductData = require('../scripts/printful/writeProductData')

module.exports = function(app) {
  app.get(
    '/shop/users',
    authSellerAndShop,
    authRole('admin'),
    async (req, res) => {
      const users = await Seller.findAll({
        attributes: ['id', 'name', 'email'],
        include: {
          model: Shop,
          attributes: ['id'],
          through: { attributes: ['role'] },
          where: { id: req.shop.id }
        }
      })

      res.json({
        success: true,
        users: users.map(user => {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: get(user, 'Shops[0].SellerShop.role')
          }
        })
      })
    }
  )

  app.get('/shop', async (req, res) => {
    const { sellerId } = req.session

    if (!sellerId) {
      return res.status(400).json({ success: false })
    }

    const rows = await Shop.findAll({ where: { sellerId } })

    const shops = []
    for (const row of rows) {
      const shopData = omit(row.dataValues, ['config', 'sellerId'])
      shopData.dataUrl = await encConf.get(row.id, 'dataUrl')
      shops.push(shopData)
    }

    res.json({
      success: true,
      shops
    })
  })

  app.post('/shop', async (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false, reason: 'not authed' })
    }

    const shopResponse = await createShop({
      listingId: req.body.listingId,
      name: req.body.name,
      authToken: req.body.dataDir,
      sellerId: req.session.sellerId
    })

    if (!shopResponse.shop) {
      console.log(`Error creating shop: ${shopResponse.error}`)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid shop data' })
    }

    const shopId = shopResponse.shop.id

    const config = {
      dataUrl: `https://${req.body.hostname}/${req.body.dataDir}/`,
      publicUrl: '',
      printful: req.body.printfulApi,
      stripeBackend: '',
      stripeWebhookSecret: '',
      pgpPublicKey: req.body.pgpPublicKey,
      pgpPrivateKey: req.body.pgpPrivateKey,
      pgpPrivateKeyPass: req.body.pgpPrivateKeyPass
    }

    console.log(`Created shop ${shopId}`)
    await encryptedConfig.assign(shopId, config)
    console.log(`Assigned config OK`)

    const role = 'admin'
    await SellerShop.create({ sellerId: req.session.sellerId, shopId, role })
    console.log(`Added role OK`)

    const { dataDir, name, pgpPublicKey, printfulApi } = req.body

    const OutputDir = `${os.tmpdir()}/dshop`
    await new Promise(resolve => exec(`rm -rf ${OutputDir}`, resolve))
    fs.mkdirSync(OutputDir, { recursive: true })
    console.log(`Outputting to ${OutputDir}`)

    await new Promise((resolve, reject) => {
      exec(
        `cp -r ${__dirname}/../dist ${OutputDir}/public`,
        (error, stdout) => {
          if (error) reject(error)
          else resolve(stdout)
        }
      )
    })

    const html = fs.readFileSync(`${OutputDir}/public/index.html`).toString()
    fs.writeFileSync(
      `${OutputDir}/public/index.html`,
      html.replace('TITLE', name).replace('DATA_DIR', dataDir)
    )

    if (printfulApi) {
      const apiAuth = Buffer.from(printfulApi).toString('base64')
      const PrintfulURL = 'https://api.printful.com'

      await downloadProductData({ OutputDir, PrintfulURL, apiAuth })
      await writeProductData({ OutputDir })
      await downloadPrintfulMockups({ OutputDir })
      await resizePrintfulMockups({ OutputDir })
    }

    const shopConfig = {
      ...configs.shopConfig,
      title: name,
      fullTitle: name,
      backendAuthToken: dataDir,
      supportEmail: `${name} Store <${dataDir}@ogn.app>`,
      emailSubject: `Your ${name} Order`,
      pgpPublicKey: pgpPublicKey.replace(/\\r/g, '')
    }

    const shopConfigPath = `${OutputDir}/data/config.json`
    fs.writeFileSync(shopConfigPath, JSON.stringify(shopConfig, null, 2))

    const shippingContent = JSON.stringify(configs.shipping, null, 2)
    fs.writeFileSync(`${OutputDir}/data/shipping.json`, shippingContent)

    await new Promise((resolve, reject) => {
      exec(
        `mv ${OutputDir}/data ${OutputDir}/public/${dataDir}`,
        (error, stdout) => {
          if (error) reject(error)
          else resolve(stdout)
        }
      )
    })

    const hash = await deploy({
      publicDirPath: `${OutputDir}/public`,
      remotePinners: ['pinata'],
      // dnsProviders: ['cloudflare'],
      siteDomain: dataDir,
      credentials: {
        // cloudflare: {
        //   apiToken: process.env.CLOUDFLARE_TOKEN,
        //   zone: process.env.CLOUDFLARE_ZONE,
        //   record: process.env.CLOUDFLARE_RECORD
        // },
        pinata: {
          apiKey: process.env.PINATA_KEY,
          secretApiKey: process.env.PINATA_SECRET
        }
      }
    })

    res.json({ success: true, hash })
  })

  app.post(
    '/shop/add-user',
    authSellerAndShop,
    authRole('admin'),
    async (req, res, next) => {
      const { seller, status, error } = await createSeller(req.body)

      if (error) {
        return res.status(status).json({ success: false, message: error })
      }

      if (!seller) {
        return res.json({ success: false })
      }

      SellerShop.create({
        sellerId: seller.id,
        shopId: req.shop.id,
        role: req.body.role
      })
        .then(() => {
          res.json({ success: true })
        })
        .catch(err => {
          console.error(err)
          next(err)
        })
    }
  )

  app.delete(
    '/shop',
    authSellerAndShop,
    authRole('admin'),
    async (req, res) => {
      await Shop.destroy({
        where: {
          id: req.body.id,
          sellerId: req.session.sellerId
        }
      })
      res.json({ success: true })
    }
  )
}
