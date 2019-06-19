import React from 'react'
import { fbt } from 'fbt-runtime'

const Earnings = ({ total = 0, earned = 0, large, title, showTotal }) => {
  const titleEl = title ? title : <fbt desc="Earnings.Earnings">Earnings</fbt>

  const earningTitle = !showTotal ? (
    <span className="earned">{earned}</span>
  ) : (
    fbt(
      fbt.param('earned', <span className="earned">{earned}</span>) +
        ' of ' +
        fbt.param('total', total),
      'Earnings.earnProgress'
    )
  )
  return (
    <div className={`earnings-progress${large ? ' large' : ''}`}>
      <div className="title">
        {titleEl}
        <div className="total-rewards">{earningTitle}</div>
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${(earned / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default Earnings

require('react-styl')(`
  .earnings-progress
    font-size: 1.1rem
    margin-bottom: 2.5rem
    &.large
      font-size: 1.5rem
    .title
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
      font-family: Poppins
      font-size: 18px
      font-weight: 300
      font-style: normal
      font-stretch: normal
      line-height: 1.06
      letter-spacing: normal
      color: var(--dark)
    .pct
      font-family: Lato
      font-weight: normal
      font-style: normal
      font-stretch: normal
      line-height: 1.36
      letter-spacing: normal
    .progress
      background-color: var(--pale-grey)
      height: 6px
      border: solid 1px var(--pale-grey-two)
      .progress-bar
        background-color: var(--clear-blue)
    
    .total-rewards
      font-family: Lato
      font-weight: normal
      font-style: normal
      font-stretch: normal
      line-height: 1.36
      letter-spacing: normal
      color: var(--bluey-grey)
      > span
        color: var(--dark)
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
        font-size: 0.9rem
        padding: 0 12px
        font-family: Lato
        line-height: 1.36
        .total-rewards > span
          font-size: 0.9rem
          font-weight: 900
          color: var(--clear-blue)
`)
