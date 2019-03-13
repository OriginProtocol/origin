import React from 'react'

import CoinPrice from 'components/CoinPrice'

const PaymentOptions = ({ acceptedTokens, value, onChange }) => {
  const daiActive = value === 'token-DAI' ? ' active' : ''
  const ethActive = value === 'token-ETH' ? ' active' : ''
  const acceptsDai = acceptedTokens.find(t => t.id === 'token-DAI')
  const daiDisabled = acceptsDai ? '' : ' disabled'
  const acceptsEth = acceptedTokens.find(t => t.id === 'token-ETH')
  const ethDisabled = acceptsEth ? '' : ' disabled'
  const shouldSwap = true

  const ethPrice = '0.73823 ETH'
  const daiPrice = '100.00 DAI'

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
          </>
        ) : (
          <>
            DAI amount will be converted from ETH (ETH value is an
            approximation)
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
