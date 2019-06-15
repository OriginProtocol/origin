import React from 'react'
import { fbt } from 'fbt-runtime'

const Earnings = ({ total = 0, earned = 0, large }) => (
  <div className={`earnings-progress${large ? ' large' : ''}`}>
    <div className="title">
      <fbt desc="Earnings.Earnings">Earnings</fbt>
      <div className="total-rewards">{total}</div>
    </div>
    <div className="progress">
      <div
        className="progress-bar"
        style={{ width: `${(earned / total) * 100}%` }}
      />
    </div>
  </div>
)

export default Earnings

require('react-styl')(`
  .earnings-progress
    font-size: 18px
    margin-bottom: 2.5rem
    &.large
      font-size: 24px
    .title
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
      font-weight: normal
    .pct
      font-weight: normal
    .progress
      background-color: var(--pale-grey)
      height: 6px
      .progress-bar
        background-color: #007bff
    
    .total-rewards
      color: #007bff
      &::before
        content: ''
        display: inline-block
        width: 1rem
        height: 1rem
        background: url(images/ogn-icon.svg) no-repeat center
        background-size: cover
        margin-right: 0.3rem
        margin-left: 0.5rem
        vertical-align: middle
  @media (max-width: 767.98px)
    .earnings-progress
      margin-bottom: 1.5rem
      .title
        font-size: 14px
`)
