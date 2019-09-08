import React from 'react'
import { fbt } from 'fbt-runtime'

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

const PaymentOptions = ({
  identity,
  acceptedTokens,
  listing,
  value,
  price,
  tokens,
  hasBalance,
  hasEthBalance,
  children,
  cannotTransact
}) => {
  if (cannotTransact && cannotTransact !== 'no-balance') {
    return children
  }
  if (!Object.keys(tokens).length) {
    return children
  }

  const daiActive = value === 'token-DAI' ? ' active' : ''
  const ethActive = value === 'token-ETH' ? ' active' : ''
  const acceptsDai = acceptedTokens.find(t => t.id === 'token-DAI')
  const acceptsEth =
    !acceptsDai || acceptedTokens.find(t => t.id === 'token-ETH')

  const ethPrice = <Price price={price} target="token-ETH" className="bold" />
  const daiPrice = <Price price={price} target="token-DAI" className="bold" />

  const hasIdentity = localStorage.noIdentity || identity

  let cannotPurchase = false,
    content,
    needsSwap = false,
    noEthOrDai = false

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

  return (
    <div className="payment-options">
      {cannotPurchase ? (
        <NotEnoughFunds
          ethPrice={ethPrice}
          daiPrice={daiPrice}
          noEthOrDai={noEthOrDai}
        />
      ) : (
        <>
          {hasIdentity && !isHistoricalListing(listing) && (
            <div className="payment-total">
              <span>
                <fbt desc="paymentOptions.payment">Payment</fbt>
              </span>
              <span className={cannotPurchase ? 'danger' : ''}>
                {needsSwap || ethActive ? ethPrice : daiPrice}
              </span>
            </div>
          )}
          {!hasIdentity || ethActive || hasBalance || needsSwap ? null : (
            <div className="exchanged">{ethPrice}</div>
          )}
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
