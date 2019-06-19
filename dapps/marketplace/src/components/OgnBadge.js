import React from 'react'
import { fbt } from 'fbt-runtime'

const OgnBadge = ({ amount, className }) => {
  if (!amount) return null

  return (
    <span className={`growth-reward-amount ${className ? className : ''}`}>
      <span className="earn">{fbt('Earn', 'Earn')}</span>
      <img src="images/ogn-icon.svg" />
      <span className="ogn">{amount}</span>
    </span>
  )
}

export default OgnBadge

require('react-styl')(`
  .growth-reward-amount.listing-card-growth-reward
    margin-left: 0.5rem
  .growth-reward-amount.listing-detail-growth-reward
    margin-left: auto
    background-color: var(--pale-grey-two)
  .growth-reward-amount
    border-radius: 1.375rem
    display: inline-flex
    align-items: center
    background-color: var(--pale-grey)
    img
      width: 17px
      height: 17px
    .earn
      font-family: Lato
      font-size: 0.875rem
      font-weight: normal
      padding: 0.25rem 0.25rem 0.25rem 0.5rem
      color: var(--steel)
    .ogn
      font-family: Lato
      font-size: 0.875rem
      font-weight: bold
      padding: 0.25rem 0.5rem 0.25rem 0.25rem
      color: var(--clear-blue)
`)
