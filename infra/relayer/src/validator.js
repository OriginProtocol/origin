const Web3 = require('web3')
const logger = require('../src/logger')

const web3 = new Web3()

const IdentityProxyBuild = require('@origin/contracts/build/contracts/IdentityProxy_solc.json')
const Proxy = new web3.eth.Contract(IdentityProxyBuild.abi)
const IdentityEventsBuild = require('@origin/contracts/build/contracts/IdentityEvents.json')
const IdentityEvents = new web3.eth.Contract(IdentityEventsBuild.abi)
const V00MarketplaceBuild = require('@origin/contracts/build/contracts/V00_Marketplace.json')
const V00Marketplace = new web3.eth.Contract(V00MarketplaceBuild.abi)
const V01MarketplaceBuild = require('@origin/contracts/build/contracts/V01_Marketplace.json')
const V01Marketplace = new web3.eth.Contract(V01MarketplaceBuild.abi)
const UniswapDaiExchangeBuild = require('./contracts/UniswapExchange.json')
const UniswapDaiExchange = new web3.eth.Contract(UniswapDaiExchangeBuild.abi)

const PROXY_HARDCODE = 'PROXY'

/**
 * Deep inspection of transactions we are requested to relay,
 * to recursively ensure that they only call allowed methods on
 * allowed contracts.
 *
 * Handles things like a transaction calling swapAndMakeOffer
 * that nest sub-transactions to the marketplace, to a unisawp exchange,
 * and to a token contract.
 */
class Validator {
  constructor(addresses) {
    // Setup the individual validators used for checking allowed transactions
    this.validators = [
      new ContractCallVailidator(
        'Marketplace V00',
        addresses.Marketplace,
        V00Marketplace._jsonInterface
      ),
      new ContractCallVailidator(
        'Marketplace V01',
        addresses.Marketplace_V01,
        V01Marketplace._jsonInterface
      ),
      new ContractCallVailidator(
        'IdentityEvents',
        addresses.IdentityEvents,
        IdentityEvents._jsonInterface
      ),
      new ProxyValidator(
        'IdentityProxy',
        PROXY_HARDCODE,
        Proxy._jsonInterface,
        { addresses: addresses }
      ),
      new UniswapValidator(
        'UniswapExchange',
        addresses.UniswapDaiExchange,
        UniswapDaiExchange._jsonInterface
      )
    ]
    // A way to look up the correct validator for an address being called.
    this.validatorsByAddress = {}
    this.validators.forEach(x => (this.validatorsByAddress[x.address] = x))
  }

  validate(address, txdata) {
    let toCheck = [[address, txdata]]

    /* Unrolled recursive transaction checks. Each address/transaction pair
       is verified, and any further verifications that are required inside that
       are added to the stack to be checked.
       
       So a check on swapAndMakeOffer would return two more validations that 
       need to be checked. Once all validates to be checked, have been checked,
       the transaction is good.

       In theory you could almost infinitily nest transactions - that's why
       there is a for loop with an explict number for how many inner transactions we are 
       willing to check.
    */

    for (let i = 1; i <= 20; i++) {
      const [_address, _txdata] = toCheck.pop()
      const validator = this.validatorsByAddress[_address]
      logger.info(`${i}. Checking call to ${_address} data ${_txdata}`)
      if (!validator) {
        logger.info(
          `Validation failed. Address ${_address} not in list of allowed contracts`
        )
        return false
      }
      const result = validator.validate(_txdata)
      if (result === false) {
        return false
      }
      toCheck = toCheck.concat(result)
      if (toCheck.length === 0) {
        logger.info(`Validation succeed`)
        return true
      }
    }
    logger.info(`Validation failed. Too many calls to check.`)
    return false
  }
}

/**
 * Base call validator. Allows known addresses and known methods by default.
 *
 * Can be inherited from to allow or disallow certain methods, or validate
 * individual method parameters.
 */
class ContractCallVailidator {
  constructor(name, address, jsonInterface, opts) {
    opts = opts || {}
    this.name = name
    this.address = address
    this.methods = this._methodsBySignature(jsonInterface)
    this.addresses = opts.addresses || {}
    const { whitelistMethods } = opts || {}
    this.whitelistMethods = whitelistMethods
  }

  validate(txdata) {
    txdata = txdata.replace(/^0x/, '')
    const signature = txdata.substring(0, 8)
    const method = this.methods[signature]
    if (method == undefined) {
      logger.info(
        `Validation failed. Method ${signature} not found on ${this.name} ${this.address}`
      )
      return false
    }
    logger.info(`  Transaction calls ${method.name} on ${this.name}`)
    const paramsHex = txdata.substr(8)
    let params = {}
    try {
      params = web3.eth.abi.decodeParameters(method.inputs, paramsHex)
    } catch (err) {
      // Do nothing, validateMethod can params data that can't be decoded.
    }
    return this.validateMethod(method, txdata, params)
  }
  /**
   * validateMethod is intended to be overwritten for invdividual contract types.
   * @param {object} method
   * @param {string} txdata
   * @param {object} params
   */

  // eslint-disable-next-line no-unused-vars
  validateMethod(method, txdata, params) {
    // Empty list of new validations to be added
    // means that no further validation is required for this method
    return []
  }

  isValidTokenAddress(address) {
    const validTokens = [this.addresses.OGN, this.addresses.DAI]
    for (const token of validTokens) {
      if (
        address.toLowerCase().replace(/^0x/, '') ===
        token.toLowerCase().replace(/^0x/, '')
      ) {
        return true
      }
    }
    return false
  }

  _methodsBySignature(jsonInterface) {
    const methods = {}
    jsonInterface
      .filter(i => i.type === 'function' && !i.constant)
      .forEach(o => (methods[o.signature.replace(/^0x/, '')] = o))
    return methods
  }
}

class ProxyValidator extends ContractCallVailidator {
  // eslint-disable-next-line no-unused-vars
  validateMethod(method, txdata, params) {
    const validationsNeeded = []
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

    if (
      method.name == 'marketplaceExecute' ||
      method.name == 'transferTokenMarketplaceExecute'
    ) {
      if (!this.isValidTokenAddress(params._token)) {
        logger.info(
          `Validation failed. ${params._token} is not an allowed token address`
        )
        return false
      }
      validationsNeeded.push([params._marketplace, params._offer])
    } else if (method.name == 'marketplaceFinalizeAndPay') {
      const isEth = params._currency === ZERO_ADDRESS
      if (!(isEth || this.isValidTokenAddress(params._currency))) {
        logger.info(
          `Validation failed. ${params._currency} is not an allowed currency address`
        )
        return false
      }
      validationsNeeded.push([params._marketplace, params._finalize])
    } else if (method.name == 'swapAndMakeOffer') {
      if (!this.isValidTokenAddress(params._token)) {
        logger.info(
          `Validation failed. ${params._token} is not an allowed ERC20 address`
        )
        return false
      }
      validationsNeeded.push([params._marketplace, params._offer])
      validationsNeeded.push([params._exchange, params._swap])
    } else if (method.name == 'transferToOwner') {
      return [] // No further validation needed
    } else {
      logger.info(
        `Validation failed. ${method.name} is not an allowed to be called on a proxy contract`
      )
      return false
    }
    return validationsNeeded
  }
}

class UniswapValidator extends ContractCallVailidator {
  // eslint-disable-next-line no-unused-vars
  validateMethod(method, txdata, params) {
    if (method.name == 'ethToTokenSwapOutput') {
      return []
    } else {
      logger.info(
        `Validation failed. ${method.name} is not an allowed to be called on an exchange contract`
      )
      return false
    }
  }
}

module.exports = {
  Validator: Validator,
  PROXY_HARDCODE: PROXY_HARDCODE
}
