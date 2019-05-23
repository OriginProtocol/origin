'use strict'

const Web3 = require('web3')
const utils = require('ethereumjs-util')
const ProxyFactoryContract = require('@origin/contracts/build/contracts/ProxyFactory_solc')
const IdentityProxyContract = require('@origin/contracts/build/contracts/IdentityProxy_solc')
const MarketplaceContract = require('@origin/contracts/build/contracts/V00_Marketplace')
const IdentityEventsContract = require('@origin/contracts/build/contracts/IdentityEvents')
const logger = require('./logger')
const db = require('./models')
const enums = require('./enums')

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

const env = process.env

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
    const v = utils.bufferToInt(
      utils.toBuffer('0x' + signature.slice(130, 132))
    )

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

    const privateKey = env.FORWARDER_PK || env[`FORWARDER_PK_${networkId}`]
    if (privateKey) {
      const wallet = this.web3.eth.accounts.wallet.add(privateKey)
      this.forwarder = wallet.address
      logger.info(`Forwarder account ${this.forwarder}`)
    }
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
  }
  /**
   * Processes a relay transaction request.
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  async relay(req, res) {
    const { signature, from, txData, to, proxy, preflight } = req.body
    logger.debug('relay called with args', {
      from,
      txData,
      to,
      proxy,
      preflight
    })

    // Pre-flight requests check if the relayer is available and willing to pay
    if (preflight) {
      logger.debug('Preflight returning true')
      return res.send({ success: true })
    }

    const web3 = this.web3

    let Forwarder = this.forwarder
    if (this.networkId === 999) {
      const nodeAccounts = await this.web3.eth.getAccounts()
      Forwarder = nodeAccounts[0]
    }
    let nonce = 0

    const IdentityProxy = this.IdentityProxy.clone()
    IdentityProxy.options.address = proxy

    const method = this.methods[txData.substr(0, 10)]
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

    let tx, txHash

    try {
      // If no proxy was specified assume the request is to deploy a proxy...
      if (!proxy) {
        if (to !== this.addresses.ProxyFactory) {
          throw new Error('Incorrect ProxyFactory address provided')
        } else if (method.name !== 'createProxyWithNonce') {
          throw new Error('Incorrect ProxyFactory method provided')
        }
        logger.debug('Deploying proxy')
        const args = { to, data: txData, from: Forwarder }
        const gas = await web3.eth.estimateGas(args)
        tx = web3.eth.sendTransaction({ ...args, gas })
      } else {
        logger.debug('Forwarding transaction')
        const rawTx = IdentityProxy.methods.forward(to, signature, from, txData)
        const gas = await rawTx.estimateGas({ from: Forwarder })
        // TODO: Not sure why we need extra gas here
        tx = rawTx.send({ from: Forwarder, gas: gas + 100000 })
      }

      const dbTx = db.RelayerTxn.create({
        status: enums.RelayerTxnStatuses.Pending,
        from,
        to,
        method: method.name,
        forwarder: Forwarder
        // TODO: capture signals into the data column for fraud prevention.
      })

      txHash = await new Promise((resolve, reject) =>
        tx
          .once('transactionHash', txHash => {
            // Resolve the promise to return right away the transaction hash to the caller.
            resolve(txHash)
          })
          .once('receipt', receipt => {
            // Once block is mined, record the amount of gas and update
            // the status of the transaction in the DB.
            const gas = receipt.gasUsed
            dbTx.update({
              status: enums.RelayerTxnStatuses.Confirmed,
              gas
            })
            logger.info(
              `Transaction with hash ${txHash} confirmed. Paid ${gas} gas`
            )
          })
          .catch(reject)
      )
      // Record the transaction hash in the DB.
      logger.info(`Submitted transaction with hash ${txHash}`)
      dbTx.update({ txnHash: txHash })
    } catch (err) {
      logger.error(err)
      return res.status(400).send({ errors: ['Error forwarding'] })
    }

    // Return the transaction hash to the caller.
    res.send({ id: txHash })
  }
}

module.exports = Relayer
