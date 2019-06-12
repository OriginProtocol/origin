'use strict'

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

    return address.toLowerCase() === from.toLowerCase()
  } catch (e) {
    logger.error('error recovering', e)
    return false
  }
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
      autofundChildren: true
    })

    this.ProxyFactory = new this.web3.eth.Contract(ProxyFactoryContract.abi)
    this.Marketplace = new this.web3.eth.Contract(MarketplaceContract.abi)
    this.IdentityEvents = new this.web3.eth.Contract(IdentityEventsContract.abi)
    this.IdentityProxy = new this.web3.eth.Contract(IdentityProxyContract.abi)

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
    const geo = isTestEnv ? '' : await ip2geo(ip)

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

    const IdentityProxy = this.IdentityProxy.clone()
    IdentityProxy.options.address = proxy

    let nonce = 0
    if (proxy) {
      nonce = await IdentityProxy.methods.nonce(from).call()
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
        if (to !== this.addresses.ProxyFactory) {
          throw new Error('Incorrect ProxyFactory address provided')
        } else if (method.name !== 'createProxyWithSenderNonce') {
          throw new Error('Incorrect ProxyFactory method provided')
        }
        logger.debug('Deploying proxy')
        const gas = 2000000 //await web3.eth.estimateGas(args)
        tx = { to, data: txData, gas }
        dbTx = await this._createDbTx(
          req,
          enums.RelayerTxnStatuses.Pending,
          from,
          to,
          method.name,
          ZeroAddress
        )
      } else {
        logger.debug('Forwarding transaction to ' + to)

        const data = IdentityProxy.methods
          .forward(to, signature, from, txData)
          .encodeABI()
        // const gas = await rawTx.estimateGas({ from: Forwarder })
        // logger.debug('Estimated gas ' + gas)
        // TODO: Not sure why we need extra gas here
        const gas = 1000000
        tx = { data, gas }
        dbTx = await this._createDbTx(
          req,
          enums.RelayerTxnStatuses.Pending,
          from,
          to,
          method.name,
          ZeroAddress
        )
      }

      try {
        txHash = await this.purse.sendTx(tx, async receipt => {
          /**
           * Once block is mined, record the amount of gas, the forwarding account,  and update the
           * status of the transaction in the DB.
           */
          const gas = receipt.gasUsed
          const hash = receipt.transactionHash
          const forwarder = receipt.from
          if (dbTx) {
            const status = enums.RelayerTxnStatuses.Confirmed
            await dbTx.update({ status, gas, forwarder })
          }
          logger.info(`Confirmed tx with hash ${hash}. Paid ${gas} gas`)
        })
      } catch (reason) {
        if (dbTx) {
          await dbTx.update({ status: enums.RelayerTxnStatuses.Failed })
        }
        logger.error('Transaction failure:', reason)
      }

      // Record the transaction hash in the DB.
      logger.info(`Submitted tx with hash ${txHash}`)
      if (dbTx) {
        await dbTx.update({ txHash })
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
