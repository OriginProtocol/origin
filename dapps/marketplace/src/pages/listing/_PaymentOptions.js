import React from 'react'
import { fbt } from 'fbt-runtime'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withWeb3 from 'hoc/withWeb3'

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
  </div>
)

const PaymentOptions = ({
  acceptedTokens,
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

  let cannotPurchase = false,
    noEthOrDai = false

  if (acceptsDai && acceptsEth && daiActive && !hasBalance && !hasEthBalance) {
    cannotPurchase = true
    noEthOrDai = true
  } else if (
    (acceptsDai && acceptsEth && ethActive && !hasBalance) ||
    (acceptsDai && !hasBalance && !hasEthBalance) ||
    (acceptsEth && !hasBalance)
  ) {
    cannotPurchase = true
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
        children
      )}
    </div>
  )
}

export default withWeb3(withWallet(withCanTransact(PaymentOptions)))

require('react-styl')(`
  .payment-options
    margin: 1rem 0
    .bold
      font-weight: bold
    .payment-total
      display: flex
      justify-content: space-between
      font-size: 24px
      font-weight: normal
      line-height: 1
      span:last-child
        font-weight: bold
      span.danger
        color: var(--orange-red)
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
      margin-bottom: 1.5rem
      &.danger
        color: var(--orange-red)
    .cannot-purchase
      line-height: normal
      a
        display: block
        font-size: 14px
        margin-top: 0.5rem
`)
