import React from 'react'
import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withWeb3 from 'hoc/withWeb3'
import { isHistoricalListing } from 'utils/listing'

import Price from 'components/Price'
import Link from 'components/Link'

const NotEnoughFunds = ({ noEthOrDai, daiPrice, ethPrice }) => (
  <div className="cannot-purchase">
    {noEthOrDai ? (
      <fbt desc="paymentOptions.notEnoughEthOrDai">
        You need <fbt:param name="daiPrice">{daiPrice}</fbt:param> or{' '}
        <fbt:param name="ethPrice">{ethPrice}</fbt:param> in your wallet to make
        this purchase.
      </fbt>
    ) : (
      <fbt desc="paymentOptions.notEnoughEth">
        You need <fbt:param name="ethPrice">{ethPrice}</fbt:param> in your
        wallet to make this purchase.
      </fbt>
    )}
    <Link to="/about/crypto">
      <fbt desc="paymentOptions.howToGetCrypto">
        How do I get cryptocurrency?
      </fbt>
    </Link>
    <button className="btn btn-primary mt-4" disabled>
      <fbt desc="Purchase">Purchase</fbt>
    </button>
  </div>
)

const PayWithDai = () => (
  <fbt desc="paymentOptions.payWithDai">
    Your DAI will be transferred to an escrow contract and held until the sale
    is completed.
  </fbt>
)

const PayWithEth = () => (
  <fbt desc="paymentOptions.payWithEth">
    Your ETH will be transferred to an escrow contract and held until the sale
    is completed.
  </fbt>
)

const SwapEthToDai = () => (
  <fbt desc="paymentOptions.swapEthToDai">
    ETH amount is an approximation and will be converted to DAI before being
    transferred to an escrow contract.
  </fbt>
)

/**
 * Component with the logic for deciding what payment options should be
 * used for a purchase.
 *
 * @param identity
 * @param {Array<string>} acceptedTokens: List of crypt-currencies accepted by the seller.
 *   Ex: ['token-ETH', 'token-DAI'] indicates the seller accepts payment in both ETH and DAI.
 * @param {Object} listing: Listing to be purchased
 * @param {string} value: Id of the currency the buyer chose to make the payment in. Ex: 'token-ETH'
 * @param {{amount:string, currency:{id:string}}} price: price of the listing.
 * @param {Object.<string, {token:string}>} tokens: Dictionary with price of the listing in various currencies.
 *  Loaded asynchronously. Empty object until loaded.
 * @param {boolean} hasBalance: True if buyer has enough token to purchase the listing
 * @param {boolean} hasEthBalance: True if buyer has enough ETH to purchase the listing.
 * @param {Object} children: React element.
 * @param {undefined||string} cannotTransact: string with reason for buyer not able to transact
 *   (ex: 'loading'), or undefined if buyer can transact.
 * @param {Object} props: React properties.
 */
const PaymentOptions = ({
  identity,
  acceptedTokens,
  listing,
  value,
  price,
  tokens,
  tokenStatus,
  children,
  cannotTransact,
  ...props
}) => {
  const isLoadingData =
    get(tokenStatus, 'loading') ||
    props.cannotTransact === 'loading' ||
    Object.keys(props).some(key => key.endsWith('Loading') && props[key])

  if (isLoadingData) {
    return null
  }

  const noBalance = cannotTransact && cannotTransact !== 'no-balance'
  const noTokens = !Object.keys(tokens).length

  let content, notEnoughFunds, paymentTotal, exchanged

  if (!noBalance && !noTokens) {
    if (!value) {
      value = tokenStatus.suggestedToken
    }

    const { hasBalance } = get(tokenStatus, value)
    const hasEthBalance = get(tokenStatus, 'token-ETH.hasBalance')

    let cannotPurchase = false,
      needsSwap = false,
      noEthOrDai = false

    const daiActive = value === 'token-DAI'
    const ethActive = value === 'token-ETH'
    const acceptsDai = acceptedTokens.find(t => t.id === 'token-DAI')
    const acceptsEth =
      !acceptsDai || acceptedTokens.find(t => t.id === 'token-ETH')

    const ethPrice = <Price price={price} target="token-ETH" className="bold" />
    const daiPrice = <Price price={price} target="token-DAI" className="bold" />

    const hasIdentity =
      localStorage.bypassOnboarding || localStorage.useWeb3Identity || identity

    if (hasIdentity && !isHistoricalListing(listing)) {
      if (acceptsDai && acceptsEth && daiActive) {
        if (hasBalance) {
          content = <PayWithDai />
        } else if (!hasBalance && !hasEthBalance) {
          cannotPurchase = true
          noEthOrDai = true
          content = <NotEnoughFunds noEthOrDai />
        } else {
          needsSwap = true
          content = <SwapEthToDai ethPrice={ethPrice} />
        }
      } else if (acceptsDai && acceptsEth && ethActive) {
        if (hasBalance) {
          content = <PayWithEth />
        } else {
          cannotPurchase = true
          content = <NotEnoughFunds />
        }
      } else if (acceptsDai) {
        if (hasBalance) {
          content = <PayWithDai />
        } else if (hasEthBalance) {
          needsSwap = true
          content = <SwapEthToDai ethPrice={ethPrice} />
        } else {
          cannotPurchase = true
          content = <NotEnoughFunds />
        }
      } else if (acceptsEth) {
        if (hasBalance) {
          content = <PayWithEth />
        } else {
          cannotPurchase = true
          content = <NotEnoughFunds />
        }
      }
    }

    if (cannotPurchase) {
      notEnoughFunds = (
        <NotEnoughFunds
          ethPrice={ethPrice}
          daiPrice={daiPrice}
          noEthOrDai={noEthOrDai}
        />
      )
    }

    if (hasIdentity) {
      paymentTotal = (
        <div className="payment-total">
          <span>
            <fbt desc="paymentOptions.payment">Payment</fbt>
          </span>
          <span className={cannotPurchase ? 'danger' : ''}>
            {needsSwap || ethActive ? ethPrice : daiPrice}
          </span>
        </div>
      )
    }

    if (!(!hasIdentity || ethActive || hasBalance || needsSwap)) {
      exchanged = <div className="exchanged">{ethPrice}</div>
    }
  }

  return (
    <div className="payment-options">
      {notEnoughFunds ? (
        notEnoughFunds
      ) : (
        <>
          {paymentTotal}
          {exchanged}
          {children}
          <div className="help">{content}</div>
        </>
      )}
    </div>
  )
}

export default withWeb3(
  withWallet(withIdentity(withCanTransact(PaymentOptions)))
)

require('react-styl')(`
  .payment-options
    border-top: 1px solid var(--light)
    margin-top: 1.5rem
    padding-top: 1.5rem
    .bold
      font-weight: bold
    .payment-total
      display: flex
      justify-content: space-between
      font-weight: normal
      line-height: 1
      span:last-child
        font-weight: bold
        font-size: 24px
      span.danger
        color: var(--orange-red)
      margin-bottom: 1.5rem
    .exchanged
      font-size: 14px
      color: var(--steel)
      text-align: right
      font-weight: bold
      margin-bottom: 0.5rem
    .help
      margin-top: 1rem
      font-size: 14px
      color: var(--steel)
      font-weight: normal
      line-height: normal
      &.danger
        color: var(--orange-red)
    .cannot-purchase
      line-height: normal
      a
        display: block
        font-size: 16px
        margin-top: 1rem
`)
