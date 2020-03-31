const inquirer = require('inquirer')
const crypto = require('crypto')
const openpgp = require('openpgp')
const fs = require('fs')
const path = require('path')
const configs = require('./configs')
const printfulAPI = require('./printful/_api')

openpgp.config.show_comment = false
openpgp.config.show_version = false

const { createSeller, findSeller, authSeller } = require('../utils/sellers')
const { createShop } = require('../utils/shop')
const createListing = require('../utils/createListing')
const encryptedConfig = require('../utils/encryptedConfig')
const { Network, Shop } = require('../models')

const downloadProductData = require('./printful/downloadProductData')
const downloadPrintfulMockups = require('./printful/downloadPrintfulMockups')
const resizePrintfulMockups = require('./printful/resizePrintfulMockups')
const writeProductData = require('./printful/writeProductData')

const PrintfulURL = 'https://api.printful.com'
// PK is acct 2 from the 'candy maple' mnemonic
const DefaultPK =
  '0xAE6AE8E5CCBFB04590405997EE2D52D2B330726137B875053C36D94E974D162F'

const validate = value => (value.length > 0 ? true : 'Please enter a value')

const userQuestions = [
  { type: 'input', name: 'email', message: 'Email', validate },
  {
    type: 'password',
    name: 'password',
    message: 'Password',
    mask: '*',
    validate
  }
]

async function go() {
  const networks = await Network.findAll({ raw: true })
  if (!networks.length) {
    console.log('No networks found in DB')
    return
  }

  let seller
  if (process.env.AUTO_LOGIN) {
    seller = await findSeller(process.env.AUTO_LOGIN)
    if (seller) {
      console.log(`Auto-logged in ${seller.email}`)
    } else {
      console.log('Auto-login failed')
    }
  }

  if (!seller) {
    const userAnswers = await inquirer.prompt(userQuestions)
    seller = await findSeller(userAnswers.email)

    if (seller) {
      const authed = await authSeller(userAnswers.email, userAnswers.password)
      if (!authed) {
        console.log('Seller exists. Incorrect password.')
        return
      }
      console.log('User authenticated OK.')
    } else {
      const nameAnswer = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Seller name',
        validate
      })
      const sellerResponse = await createSeller({
        ...userAnswers,
        ...nameAnswer
      })
      seller = sellerResponse.seller

      if (seller) {
        console.log(`Created seller ${seller.id}`)
      } else {
        console.log(`Error creating seller: ${sellerResponse.error}`)
        return
      }
    }
  }

  const taskQuestions1 = [
    {
      type: 'list',
      name: 'listing',
      message: 'Contract listing',
      choices: [
        { name: 'Create new', value: 'create' },
        { name: 'Use existing', value: 'existing' }
      ]
    },
    {
      type: 'list',
      name: 'networkId',
      message: 'Network',
      when: ({ listing }) => listing === 'create',
      choices: [
        { name: 'Localhost', value: '999' },
        { name: 'Rinkeby', value: '4' },
        { name: 'Mainnet', value: '1' }
      ]
    },
    {
      type: 'input',
      name: 'listingId',
      message: 'Listing ID',
      when: ({ listing }) => listing === 'existing',
      validate
    },
    {
      type: 'password',
      mask: '*',
      name: 'pk',
      message: 'Private Key (defaults to candy maple acct 2)',
      when: ({ listing }) => listing === 'create'
    },
    {
      type: 'input',
      name: 'shopName',
      message: 'Shop Name',
      validate
    }
  ]

  const taskAnswers1 = await inquirer.prompt(taskQuestions1)

  const { shopName, listing } = taskAnswers1
  const pk = taskAnswers1.pk || DefaultPK
  let { listingId, networkId } = taskAnswers1
  if (listingId && !networkId) {
    networkId = listingId.split('-')[0]
  }

  if (listingId) {
    const existingShop = await Shop.findOne({ where: { listingId } })
    if (existingShop) {
      console.log(`Shop exists with listing ID ${listingId}`)
      return
    }
  }

  if (listing === 'create') {
    const network = await Network.findOne({ where: { networkId } })
    if (!network) {
      console.log(`No network ${networkId} defined in DB`)
      return
    }
    listingId = await createListing({ network, pk, title: shopName })
    console.log(`Created listing ${listingId}`)
  }

  const taskQuestions2 = [
    {
      type: 'input',
      name: 'dataDir',
      message: 'Data directory',
      validate,
      default: () => shopName.toLowerCase().split(' ')[0]
    },
    {
      type: 'list',
      name: 'shopType',
      message: 'Shop type',
      choices: [
        { name: 'New from Printful', value: 'printful' },
        { name: 'New from Shopify', value: 'shopify' },
        { name: 'New from Template', value: 'template' },
        { name: 'Use existing', value: 'existing' }
      ]
    },
    {
      type: 'input',
      name: 'printfulApi',
      message: 'Printful API Key',
      when: ({ shopType }) => shopType === 'printful',
      validate: function(apiKey) {
        if (!apiKey) {
          return 'Printful API key required'
        }
        const done = this.async()
        printfulAPI
          .get('/store', { apiKey })
          .then(json => {
            if (json.error) {
              done(json.error.message)
            } else {
              done(null, true)
            }
          })
          .catch(done)
      }
    },
    {
      type: 'input',
      name: 'hostname',
      message: 'Hostname',
      when: () => listing === 'create'
    }
  ]
  const taskAnswers2 = await inquirer.prompt(taskQuestions2)

  const { dataDir, printfulApi, hostname } = taskAnswers2

  const shop = {
    listingId,
    authToken: dataDir,
    sellerId: seller.id,
    name: shopName
  }
  const shopResponse = await createShop(shop)

  const pgpPrivateKeyPass = crypto.randomBytes(32).toString('hex')
  const key = await openpgp.generateKey({
    userIds: [{ name: 'D-Shop', email: `dshop@example.com` }],
    curve: 'ed25519',
    passphrase: pgpPrivateKeyPass
  })
  const pgpPublicKey = key.publicKeyArmored.replace(/\\r/g, '')
  const pgpPrivateKey = key.privateKeyArmored.replace(/\\r/g, '')

  const config = {
    dataUrl: `https://${hostname}/${dataDir}/`,
    publicUrl: '',
    printful: printfulApi,
    stripeBackend: '',
    stripeWebhookSecret: '',
    pgpPublicKey,
    pgpPrivateKey,
    pgpPrivateKeyPass
  }

  if (!shopResponse.shop) {
    console.log(`Error creating shop: ${shopResponse.error}`)
    return
  }

  console.log(`Created shop ${shopResponse.shop.id}`)
  await encryptedConfig.assign(shopResponse.shop.id, config)
  // console.log(`Public PGP Key:`)
  // console.log(JSON.stringify(pgpPublicKey).replace(/\\r/g, ''))

  const prefix = `${__dirname}/output/${dataDir}/data`
  if (!fs.existsSync(prefix)) {
    console.log('Creating data dirs')
    fs.mkdirSync(prefix, { recursive: true })

    fs.writeFileSync(
      `${prefix}/config.json`,
      JSON.stringify(
        {
          ...configs.shopConfig,
          title: shopName,
          fullTitle: shopName,
          backendAuthToken: dataDir,
          supportEmail: `${shopName} Store <${dataDir}@ogn.app>`,
          emailSubject: `Your ${shopName} Order`,
          pgpPublicKey: pgpPublicKey.replace(/\\r/g, '')
        },
        null,
        2
      )
    )

    fs.writeFileSync(
      `${prefix}/shipping.json`,
      JSON.stringify(configs.shipping, null, 2)
    )

    if (!fs.existsSync(path.normalize(`data/${dataDir}`))) {
      console.log('Creating symlink')
      fs.symlinkSync(
        path.normalize(`${__dirname}/output/${dataDir}/data`),
        path.normalize(`data/${dataDir}`)
      )
    }
  }

  if (printfulApi) {
    const OutputDir = `${__dirname}/output/${dataDir}`
    const apiAuth = Buffer.from(printfulApi).toString('base64')

    await downloadProductData({ OutputDir, PrintfulURL, apiAuth })
    await writeProductData({ OutputDir })
    await downloadPrintfulMockups({ OutputDir })
    await resizePrintfulMockups({ OutputDir })
  }
}

go()
