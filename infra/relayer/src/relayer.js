'use strict'

const memoize = require('lodash/memoize')
const Web3 = require('web3')
const utils = require('ethereumjs-util')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')
const { ip2geo } = require('@origin/ip2geo')
const Purse = require('./purse')
const logger = require('./logger')
const db = require('./models')
const enums = require('./enums')

let RiskEngine
if (process.env.NODE_ENV === 'production' || process.env.USE_PROD_RISK) {
  RiskEngine = require('./risk/prod/engine')
  logger.info('Loaded PROD risk engine.')
} else {
  RiskEngine = require('./risk/dev/engine')
  logger.info('Loaded DEV risk engine.')
}

const env = process.env
const isTestEnv = env.NODE_ENV === 'test'

const DefaultProviders = {
  1: 'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2',
  4: 'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',
  999: 'http://localhost:8545',
  2222: 'https://testnet.originprotocol.com/rpc'
}

const ContractAddresses = {
  1: '@origin/contracts/build/contracts_mainnet.json',
  4: '@origin/contracts/build/contracts_rinkeby.json',
  999: '@origin/contracts/build/contracts.json',
  2222: '@origin/contracts/build/contracts_origin.json'
}

const ZeroAddress = '0x00000000000000000000000000000000000000'

if (isTestEnv) {
  ContractAddresses['999'] = '@origin/contracts/build/tests.json'
}

const normalizeAddress = addr => {
  return addr.toLowerCase()
}

const verifySig = async ({ web3, to, from, signature, txData, nonce = 0 }) => {
  const signedData = web3.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: web3.utils.toWei('0', 'ether') },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )

  try {
    const msgBuffer = utils.toBuffer(signedData)

    const prefix = Buffer.from('\x19Ethereum Signed Message:\n')
    const prefixedMsg = utils.keccak256(
      Buffer.concat([prefix, Buffer.from(String(msgBuffer.length)), msgBuffer])
    )

    const r = utils.toBuffer(signature.slice(0, 66))
    const s = utils.toBuffer('0x' + signature.slice(66, 130))
    let v = utils.bufferToInt(utils.toBuffer('0x' + signature.slice(130, 132)))
    // In case whatever signs doesn't add the magic number, nor use EIP-155
    if ([0, 1].indexOf(v) > -1) v += 27

    const pub = utils.ecrecover(prefixedMsg, v, r, s)
    const address = '0x' + utils.pubToAddress(pub).toString('hex')

    return normalizeAddress(address) === normalizeAddress(from)
  } catch (e) {
    logger.error('error recovering', e)
    return false
  }
}

const proxyCreationCode = memoize(async (web3, ProxyFactory, ProxyImp) => {
  let code = await ProxyFactory.methods.proxyCreationCode().call()
  code += web3.eth.abi.encodeParameter('uint256', ProxyImp._address).slice(2)
  return code
})

async function predictedProxy(web3, ProxyFactory, ProxyImp, address) {
  const salt = web3.utils.soliditySha3(address, 0)
  const creationCode = await proxyCreationCode(web3, ProxyFactory, ProxyImp)
  const creationHash = web3.utils.sha3(creationCode)

  // Expected proxy address can be worked out thus:
  const create2hash = web3.utils
    .soliditySha3('0xff', ProxyFactory._address, salt, creationHash)
    .slice(-40)

  return web3.utils.toChecksumAddress(`0x${create2hash}`)
}

class Relayer {
  /**
   *
   * @param {integer} networkId 1=mainnet, 4=rinkeby, etc...
   */
  constructor(networkId) {
    this.networkId = Number(networkId)

    if (!ContractAddresses[networkId]) {
      throw new Error(`Unsupported network id ${networkId}`)
    }

    this.addresses = require(ContractAddresses[networkId])
    logger.info('Addresses', this.addresses)

    const providerUrl = env.PROVIDER_URL || DefaultProviders[networkId]
    if (!providerUrl) {
      throw new Error('Provider url not defined')
    }
    logger.info(`Provider URL: ${providerUrl}`)
    this.web3 = new Web3(providerUrl)

    this.purse = new Purse({
      web3: this.web3,
      mnemonic: env.FORWARDER_MNEMONIC,
      children: env.FORWARDER_ACCOUNTS ? parseInt(env.FORWARDER_ACCOUNTS) : 3,
      autofundChildren: true,
      redisHost: env.REDIS_URL
    })

    this.ProxyFactory = new this.web3.eth.Contract(
      ProxyFactoryContract.abi,
      this.addresses.ProxyFactory
    )
    this.Marketplace = new this.web3.eth.Contract(MarketplaceContract.abi)
    this.IdentityEvents = new this.web3.eth.Contract(IdentityEventsContract.abi)
    this.IdentityProxy = new this.web3.eth.Contract(
      IdentityProxyContract.abi,
      this.addresses.IdentityProxyImplementation
    )

    this.methods = {}
    this.Marketplace._jsonInterface
      .concat(this.IdentityProxy._jsonInterface)
      .concat(this.IdentityEvents._jsonInterface)
      .concat(this.ProxyFactory._jsonInterface)
      .filter(i => i.type === 'function' && !i.constant)
      .forEach(o => (this.methods[o.signature] = o))

    this.riskEngine = new RiskEngine()
  }

  /**
   * Inserts a row in the DB to track the transaction.
   *
   * @param req
   * @param status
   * @param from
   * @param to
   * @param method
   * @param forwarder
   * @param ip
   * @param geo
   * @returns {Promise<models.RelayerTxn>}
   * @private
   */
  async _createDbTx(req, status, from, to, method, forwarder, ip, geo) {
    if (!db.RelayerTxn) return

    // TODO: capture extra signals for fraud detection and store in data.
    const data = geo ? { ip, country: geo.countryCode } : { ip }

    return await db.RelayerTxn.create({
      status,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      method,
      forwarder: forwarder.toLowerCase(),
      data
    })
  }

  /**
   * Processes a relay transaction request.
   *
   * @param {Object} req - Request
   * @param {Object} res - Response
   * @returns {Promise<*>}
   */
  async relay(req, res) {
    const { signature, from, txData, to, proxy, preflight } = req.body
    logger.debug('relay called with args:', {
      from,
      txData,
      to,
      proxy,
      preflight
    })

    // Make sure keys are generated and ready
    await this.purse.init()

    const web3 = this.web3

    const method = this.methods[txData.substr(0, 10)]

    // Get the IP from the request header and resolve it into a country code.
    const ip = req.header('x-real-ip')
    const geo = await ip2geo(ip)

    // Check if the relayer is willing to process the transaction.
    const accept = await this.riskEngine.acceptTx(from, to, txData, ip, geo)
    if (!accept) {
      // Log the decline in the DB to use as data for future accept decisions.
      await this._createDbTx(
        req,
        enums.RelayerTxnStatuses.Declined,
        from,
        to,
        method.name,
        ZeroAddress,
        ip,
        geo
      )
    }

    // Pre-flight requests check if the relayer is available and willing to pay
    if (preflight) {
      return res.send({ success: accept })
    }

    const UserProxy = this.IdentityProxy.clone()
    UserProxy.options.address = proxy

    // For proxy verification
    const predictedAddress = await predictedProxy(
      web3,
      this.ProxyFactory,
      this.IdentityProxy,
      from
    )
    const code = await web3.eth.getCode(predictedAddress)

    let nonce = 0
    if (proxy) {
      // Verify a proxy exists
      if (code === '0x') {
        logger.error(
          `Proxy does not exist at ${predictedAddress} for user ${from}`
        )
        return res.status(400).send({ errors: ['Proxy exists'] })
      }

      // Check if it already has pending
      /**
       * TODO: This is a temporary solution to prevent users from submitting a
       * tx with a bad proxy nonce.  A more permanent solution will be required.
       * See: https://github.com/OriginProtocol/origin/issues/2631
       */
      if (await this.purse.hasPendingTo(proxy)) {
        logger.warn(`Proxy ${proxy} already has a pending transaction`)
        return res
          .status(429)
          .send({ errors: ['Proxy has pending transaction'] })
      }

      nonce = await UserProxy.methods.nonce(from).call()

      logger.debug(`Using nonce ${nonce} for user ${from} via proxy ${proxy}`)
    } else {
      // Verify a proxy doesn't already exist
      if (code !== '0x') {
        logger.error(
          `Proxy already exists at ${predictedAddress} for user ${from}`
        )
        return res.status(400).send({ errors: ['Proxy exists'] })
      }
    }

    const args = { to, from, signature, txData, web3, nonce }
    const sigValid = await verifySig(args)
    if (!sigValid) {
      logger.debug('Invalid signature.')
      return res.status(400).send({ errors: ['Cannot verify your signature'] })
    }

    // 2. Verify txData and check function signature
    if (!method) {
      logger.debug('Invalid method')
      return res.status(400).send({ errors: ['Invalid function signature'] })
    }

    let tx, txHash, dbTx

    try {
      // If no proxy was specified assume the request is to deploy a proxy...
      if (!proxy) {
        if (
          normalizeAddress(to) !== normalizeAddress(this.addresses.ProxyFactory)
        ) {
          throw new Error('Incorrect ProxyFactory address provided')
        } else if (method.name !== 'createProxyWithSenderNonce') {
          throw new Error('Incorrect ProxyFactory method provided')
        }
        logger.debug('Deploying proxy')
        const gas = 500000 // 500k gas. Value set based on observing Mainnet transactions.
        tx = { to, data: txData, gas }
        dbTx = await this._createDbTx(
          req,
          enums.RelayerTxnStatuses.Pending,
          from,
          to,
          method.name,
          ZeroAddress,
          ip,
          geo
        )
      } else {
        logger.debug('Forwarding transaction to ' + to)

        const data = UserProxy.methods
          .forward(to, signature, from, txData)
          .encodeABI()
        const gas = 250000 // 250k gas. Value set based on observing Mainnet transactions.
        tx = { to: proxy, data, gas }
        dbTx = await this._createDbTx(
          req,
          enums.RelayerTxnStatuses.Pending,
          from,
          to,
          method.name,
          ZeroAddress,
          ip,
          geo
        )
      }

      let txOut
      try {
        txOut = await this.purse.sendTx(tx, async receipt => {
          /**
           * Once block is mined, record the amount of gas, the forwarding account,
           * and the status of the transaction in the DB.
           */
          const gas = receipt.gasUsed
          const hash = receipt.transactionHash
          const forwarder = receipt.from
          const status = receipt.status
            ? enums.RelayerTxnStatuses.Confirmed
            : enums.RelayerTxnStatuses.Reverted
          if (dbTx) {
            await dbTx.update({ status, gas, forwarder })
          }
          logger.info(
            `Tx with hash ${hash} mined. Status: ${status}. Gas used: ${gas}.`
          )
        })
      } catch (reason) {
        let status = enums.RelayerTxnStatuses.Failed
        let errMsg = 'Error sending transaction'

        if (reason.message && reason.message.indexOf('gas prices') > -1) {
          status = enums.RelayerTxnStatuses.GasLimit
          errMsg = 'Network is too congested right now.  Try again later.'
        }

        if (dbTx) {
          await dbTx.update({ status })
        }

        logger.error('Transaction failure:', reason)
        return res.status(400).send({ errors: [errMsg] })
      }

      // Record the transaction hash and gas price in the DB.
      txHash = txOut.txHash
      const gasPrice = txOut.gasPrice.toNumber()
      logger.info(`Submitted tx with hash ${txHash} at gas price ${gasPrice}`)
      if (dbTx) {
        await dbTx.update({ txHash, gasPrice })
      }
    } catch (err) {
      logger.error(err)
      const errors = ['Error forwarding']
      if (isTestEnv) errors.push(err.toString())
      return res.status(400).send({ errors })
    }

    // Return the transaction hash to the caller.
    res.send({ id: txHash })
  }
}

module.exports = Relayer
