require('dotenv').config()
const randomstring = require('randomstring')

const NETWORK_NAME_TO_ID = {
  dev: 999,
  rinkeby: 4,
  mainnet: 1
}

const CONTRACTS = {
  999: {
    marketplace: {
      '000': '0xBFF408fD7DCb4E9B3fF68941699636a86B93eD7C',
      '001': '0x46e4572294987fbeE82DDe6Ca7168f7C2E1bB83e'
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
  DATA_URL, // single tennant only TODO nah brah
  SESSION_SECRET = randomstring.generate(),
  SERVER_HOSTNAME = 'localhost',
  NETWORK = IS_PROD ? 'rinkeby' : 'dev',
  PROVIDER,
  IPFS_GATEWAY, // IFPS gateway oerride
  MARKETPLACE_CONTRACT // address override for multi-tenant
} = process.env

const PASSWORD_SALT_ROUNDS = 10

module.exports = {
  CONTRACTS,
  DATA_URL,
  NODE_ENV,
  IS_PROD,
  SESSION_SECRET,
  SERVER_HOSTNAME,
  PASSWORD_SALT_ROUNDS,
  PROVIDER,
  IPFS_GATEWAY,
  NETWORK,
  NETWORK_ID: NETWORK_NAME_TO_ID[NETWORK] || 999,
  MARKETPLACE_CONTRACT
}
