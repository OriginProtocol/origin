const inquirer = require('inquirer')
const crypto = require('crypto')
const openpgp = require('openpgp')

openpgp.config.show_comment = false
openpgp.config.show_version = false

const { createSeller, findSeller, authSeller } = require('../utils/sellers')
const { createShop } = require('../utils/shop')
const encryptedConfig = require('../utils/encryptedConfig')

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

const shopQuestions = [
  { type: 'input', name: 'listingId', message: 'Listing ID', validate },
  { type: 'input', name: 'name', message: 'Shop name', validate },
  {
    type: 'input',
    name: 'authToken',
    message: 'Auth Token (leave empty to generate)'
  },
  { type: 'input', name: 'hostname', message: 'Hostname' }
]

async function go() {
  const userAnswers = await inquirer.prompt(userQuestions)

  let seller = await findSeller(userAnswers.email)

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
    const sellerResponse = await createSeller({ ...userAnswers, ...nameAnswer })
    seller = sellerResponse.seller

    if (seller) {
      console.log(`Created seller ${seller.id}`)
    } else {
      console.log(`Error creating seller: ${sellerResponse.error}`)
      return
    }
  }

  const shopAnswers = await inquirer.prompt(shopQuestions)

  const shop = {
    ...shopAnswers,
    sellerId: seller.id
  }
  if (!shop.authToken) {
    shop.authToken = crypto.randomBytes(32).toString('hex')
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
    dataUrl: '',
    publicUrl: '',
    printful: '',
    stripeBackend: '',
    stripeWebhookSecret: '',
    pgpPublicKey,
    pgpPrivateKey,
    pgpPrivateKeyPass
  }

  if (shopResponse.shop) {
    console.log(`Created shop ${shopResponse.shop.id}`)
    console.log(`Public PGP Key:`)
    console.log(JSON.stringify(pgpPublicKey).replace(/\\r/g, ''))
    await encryptedConfig.assign(shopResponse.shop.id, config)
  } else {
    console.log(`Error creating shop: ${shopResponse.error}`)
  }
}

go()
