require('dotenv').config()
const randomstring = require('randomstring')

try {
  require('envkey')
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    console.error(err)
    process.exit(1)
  }
}

const NETWORK_NAME_TO_ID = {
  localhost: 999,
  rinkeby: 4,
  mainnet: 1
}

const CONTRACTS = {
  999: {
    marketplace: {
      '000': process.env.MARKETPLACE_CONTRACT,
      '001': process.env.MARKETPLACE_CONTRACT
    }
  },
  4: {
    marketplace: {
      '000': '0xe842831533c4bf4B0F71B4521C4320BDB669324E',
      '001': '0x3D608cCe08819351adA81fC1550841ebc10686fd'
    }
  },
  1: {
    marketplace: {
      '000': '0x819Bb9964B6eBF52361F1ae42CF4831B921510f9',
      '001': '0x698Ff47B84837d3971118a369c570172EE7e54c2'
    }
  }
}

const NODE_ENV = process.env.NODE_ENV
const IS_PROD = NODE_ENV === 'production'

const {
  SESSION_SECRET = randomstring.generate(),
  ENCRYPTION_KEY,
  NETWORK = IS_PROD ? 'rinkeby' : 'dev',
  WEB3_PK,
  PROVIDER,
  PROVIDER_WS,
  IPFS_GATEWAY, // IFPS gateway oerride
  SUPPORT_EMAIL_OVERRIDE,
  SENDGRID_API_KEY,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
  MAILGUN_SMTP_SERVER,
  MAILGUN_SMTP_PORT,
  MAILGUN_SMTP_LOGIN,
  MAILGUN_SMTP_PASSWORD,
  AWS_ACCESS_KEY_ID
} = process.env

/**
 * This is a placeholder for possible future single-tennant override. Currently
 * it does nothing, so don't bother setting it.  Instead create a single store
 * config.
 */
const DATA_URL = null
const PASSWORD_SALT_ROUNDS = 10
const PRINTFUL_URL = 'https://api.printful.com'

module.exports = {
  CONTRACTS,
  ENCRYPTION_KEY,
  DATA_URL,
  NODE_ENV,
  IS_PROD,
  SESSION_SECRET,
  PASSWORD_SALT_ROUNDS,
  WEB3_PK,
  PROVIDER_WS,
  PROVIDER,
  IPFS_GATEWAY,
  NETWORK,
  NETWORK_ID: NETWORK_NAME_TO_ID[NETWORK] || 999,
  SUPPORT_EMAIL_OVERRIDE,
  SENDGRID_API_KEY,
  SENDGRID_USERNAME,
  SENDGRID_PASSWORD,
  MAILGUN_SMTP_SERVER,
  MAILGUN_SMTP_PORT,
  MAILGUN_SMTP_LOGIN,
  MAILGUN_SMTP_PASSWORD,
  AWS_ACCESS_KEY_ID,
  PRINTFUL_URL
}
