import { post } from '@origin/ipfs'
import validator from '@origin/validator'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import currencies from '../../utils/currencies'
import {
  isContract,
  proxyOwner,
  predictedProxy,
  resetProxyCache
} from '../../utils/proxy'
import { swapToTokenTx } from '../uniswap/swapToToken'
import createDebug from 'debug'
import { checkForMessagingOverride } from '../../resolvers/messaging/Messaging'
const debug = createDebug('origin:makeOffer:')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

async function makeOffer(_, data) {
  const { listingId, marketplace } = parseId(data.listingID, contracts)

  await checkMetaMask(data.from)

  const buyer = data.from || contracts.defaultMobileAccount
  if (!marketplace) {
    throw new Error('No marketplace')
  }

  let messagingOverride
  if ((messagingOverride = checkForMessagingOverride())) {
    // Skip encryption in test environment
    data.shippingAddressEncrypted = JSON.stringify(
      messagingOverride.shippingOverride
    )
  } else if (data.shippingAddress && data.shippingAddress !== '') {
    const listing = await marketplace.eventSource.getListing(listingId)
    let seller = await proxyOwner(listing.seller.id)
    seller = seller || listing.seller.id
    const shippingAddress = Object.assign({}, data.shippingAddress)
    shippingAddress.version = 1
    const encrypted = await contracts.messaging.createOutOfBandMessage(
      seller,
      JSON.stringify(shippingAddress)
    )
    if (!encrypted) {
      throw new Error(
        'Could not encrypt shipping address. Probably either buyer or seller do not have messaging enabled.'
      )
    }
    data.shippingAddressEncrypted = encrypted
    data.shippingAddress = undefined
  }

  const ipfsData = await toIpfsData(data, marketplace)
  let mutation = 'makeOffer'

  const affiliateWhitelistDisabled = await marketplace.contract.methods
    .allowedAffiliates(marketplace.contract.options.address)
    .call()

  const affiliate = data.affiliate || contracts.config.affiliate || ZeroAddress
  if (!affiliateWhitelistDisabled) {
    const affiliateAllowed = await marketplace.contract.methods
      .allowedAffiliates(affiliate)
      .call()

    if (!affiliateAllowed) {
      throw new Error(`Affiliate ${affiliate} not on whitelist`)
    }
  }

  // TODO: add defaults for currency, affiliate, etc. so that default invocation
  // is more concise

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const commission = contracts.web3.utils.toWei(
    ipfsData.commission.amount,
    'ether'
  )
  const value = contracts.web3.utils.toWei(data.value, 'ether')
  const arbitrator = data.arbitrator || contracts.config.arbitrator
  const currency = await currencies.get(data.currency)

  let currencyAddress = currency.address
  if (!currencyAddress) {
    const contractToken = contracts.tokens.find(t => t.symbol === currency.code)
    if (contractToken) {
      currencyAddress = contractToken.id
    }
  }
  if (!currencyAddress) {
    throw new Error(`Could not find token address for ${data.currency}`)
  }

  const args = [
    listingId,
    ipfsHash,
    ipfsData.finalizes,
    affiliate,
    commission,
    value,
    currencyAddress || ZeroAddress,
    arbitrator
  ]
  if (data.withdraw) {
    const { offerId } = parseId(data.withdraw)
    args.push(offerId)
  }

  let ethValue = currencyAddress === ZeroAddress ? value : 0
  let tx = marketplace.contractExec.methods.makeOffer(...args)
  if (contracts.config.proxyAccountsEnabled) {
    let owner = await proxyOwner(buyer)
    const isProxy = owner ? true : false
    if (currencyAddress !== ZeroAddress) {
      let proxy = buyer
      if (!owner) {
        owner = buyer
        proxy = await predictedProxy(buyer)
        // This shouldn't happen at this point, a proxy should already exist
        if (!isContract(proxy)) {
          throw new Error('Proxy does not exist')
        }
      }
      const Proxy = new contracts.web3Exec.eth.Contract(
        IdentityProxy.abi,
        proxy
      )
      const txData = await tx.encodeABI()

      if (data.autoswap) {
        const swapTx = await swapToTokenTx(value)
        const swapABI = await swapTx.tx.encodeABI()
        tx = Proxy.methods.swapAndMakeOffer(
          owner, // address _owner,
          marketplace.contract._address, // address _marketplace,
          txData, // bytes _offer,
          contracts.daiExchange._address, // address _exchange,
          swapABI, // bytes _swap,
          currencyAddress, // address _token,
          value // uint _value
        )
        ethValue = swapTx.value // Eth value should cover exchange costs
        if (isProxy) {
          mutation = 'swapAndMakeOffer'
        }
        debug(`attempting to autoswap ${value} Eth`)
      } else {
        debug('transferTokenMarketplaceExecute', { value, currencyAddress })
        tx = Proxy.methods.transferTokenMarketplaceExecute(
          owner,
          marketplace.contract._address,
          txData,
          currencyAddress,
          value
        )
        mutation = 'transferTokenMarketplaceExecute'
      }
    }
  }

  return txHelper({
    tx,
    from: buyer,
    mutation,
    gas: cost.makeOffer,
    value: ethValue,
    onConfirmation: () => resetProxyCache()
  })
}

async function toIpfsData(data, marketplace) {
  const { listingId } = parseId(data.listingID)
  const listing = await marketplace.eventSource.getListing(listingId)
  const web3 = contracts.web3

  // Validate units purchased vs. available
  const unitsAvailable = Number(listing.unitsAvailable)
  const offerQuantity = Number(data.quantity)
  if (offerQuantity > unitsAvailable) {
    throw new Error(
      `Insufficient units available (${unitsAvailable}) for offer (${offerQuantity})`
    )
  }

  const commission = { currency: 'OGN', amount: '0' }
  if (data.commission) {
    // Passed in commission takes precedence
    commission.amount = web3.utils.fromWei(data.commission, 'ether')
  } else if (listing.commissionPerUnit) {
    // Default commission to min(depositAvailable, commissionPerUnit)
    const amount = web3.utils
      .toBN(listing.commissionPerUnit)
      .mul(web3.utils.toBN(data.quantity))
    const depositAvailable = web3.utils.toBN(listing.depositAvailable)
    const commissionWei = amount.lt(depositAvailable)
      ? amount.toString()
      : depositAvailable.toString()
    commission.amount = web3.utils.fromWei(commissionWei, 'ether')
  }

  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/offer_2.0.0.json',
    listingId: data.listingID,
    listingType: 'unit',
    unitsPurchased: Number.parseInt(data.quantity),
    totalPrice: {
      amount: data.value,
      currency: data.currency
    },
    commission,
    finalizes: data.finalizes || 60 * 60 * 24 * 14,
    shippingAddressEncrypted: data.shippingAddressEncrypted,
    ...(data.fractionalData || {})
  }

  validator('https://schema.originprotocol.com/offer_2.0.0.json', ipfsData)

  return ipfsData
}

export default makeOffer
