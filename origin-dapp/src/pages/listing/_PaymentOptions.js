import React from 'react'
import get from 'lodash/get'

import CoinPrice from 'components/CoinPrice'
import Price from 'components/Price2'

const PaymentOptions = ({ acceptedTokens, value, onChange, price, tokens }) => {
  const daiActive = value === 'token-DAI' ? ' active' : ''
  const ethActive = value === 'token-ETH' ? ' active' : ''
  const acceptsDai = acceptedTokens.find(t => t.id === 'token-DAI')
  const daiDisabled = acceptsDai ? '' : ' disabled'
  const acceptsEth = !acceptsDai || acceptedTokens.find(t => t.id === 'token-ETH')
  const ethDisabled = acceptsEth ? '' : ' disabled'

  let shouldSwap = false
  let needsAllowance = false
  const daiBalance = get(tokens, 'token-DAI.currency.balance')
  const daiAllowance = get(tokens, 'token-DAI.currency.allowance')

  if (value === 'token-DAI' && daiBalance) {
    const availableBN = Number(web3.utils.fromWei(daiBalance, 'ether'))
    const requiredBN = Number(price.amount)
    shouldSwap = availableBN < requiredBN

    const availableAllowance = Number(web3.utils.fromWei(daiAllowance, 'ether'))
    const requiredAllowance = Number(price.amount)
    needsAllowance = availableAllowance < requiredAllowance
  }

  const ethPrice = <Price price={price} target="token-ETH" />
  const daiPrice = <Price price={price} target="token-DAI" />

  return (
    <div className="payment-options">
      <h6>Pay with</h6>
      <div className="btn-group">
        <button
          className={`btn btn-outline-secondary${daiActive}${daiDisabled}`}
          onClick={() => (daiDisabled ? null : onChange('token-DAI'))}
        >
          <CoinPrice iconOnly coin="dai" className="lg" />
          DAI
        </button>
        <button
          className={`btn btn-outline-secondary${ethActive}${ethDisabled}`}
          onClick={() => (ethDisabled ? null : onChange('token-ETH'))}
        >
          <CoinPrice iconOnly coin="eth" className="lg" />
          ETH
        </button>
      </div>
      <div className="payment-total">
        <span>Payment</span>
        <span>{ethActive ? ethPrice : daiPrice}</span>
      </div>
      {ethActive || !shouldSwap ? null : (
        <div className="exchanged">{ethPrice}</div>
      )}
      <div className="help">
        {ethActive ? (
          <>
            Your ETH will be transferred to an escrow contract and held until
            the sale is completed.
          </>
        ) : !shouldSwap ? (
          <>
            Your DAI will be transferred to an escrow contract and held until
            the sale is completed.
            {needsAllowance ? ' (needs allowance)' : null}
          </>
        ) : (
          <>
            DAI amount will be converted from ETH (ETH value is an
            approximation)
            {needsAllowance ? ' (needs allowance)' : null}
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentOptions

require('react-styl')(`
  .payment-options
    border-top: 1px solid var(--light)
    padding-top: 1.5rem
    margin-top: 1.5rem
    h6
      color: var(--dark)
      font-size: 14px
      font-weight: normal
    .btn-group
      width: 100%
      .btn
        font-size: 18px
        font-weight: normal
      .btn-outline-secondary
        color: var(--dark)
        border-color: var(--light)
        &:not(.disabled):hover
          border-color: var(--dusk)
          color: var(--white)
        &.active
          border-color: var(--dusk)
          background-color: var(--dusk)
    .payment-total
      margin-top: 1.5rem
      display: flex
      justify-content: space-between
      font-size: 24px
      font-weight: normal
      line-height: 1
      span:last-child
        font-weight: bold
    .exchanged
      font-size: 14px
      color: var(--steel)
      text-align: right
      font-weight: bold
      margin-bottom: 0.5rem
    .help
      margin-top: 0.5rem
      font-size: 14px
      color: var(--steel)
      font-weight: normal
      line-height: normal
      margin-bottom: 1.5rem
`)
