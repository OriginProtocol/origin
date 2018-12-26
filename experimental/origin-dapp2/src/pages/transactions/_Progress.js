import React from 'react'

const TransactionProgress = () => (
  <div className="transaction-progress">
    <h4>Next Step</h4>
    <div className="next-step">
      Give your shipping address to seller
    </div>
    <div className="help">Click the button to open messaging</div>
    <button className="btn btn-link">Message Seller &rsaquo;</button>
    <div className="stages">
      <div>Offer Placed</div>
      <div>Offer Accepted</div>
      <div>Received by buyer</div>
    </div>
  </div>
)

export default TransactionProgress

require('react-styl')(`
  .transaction-progress
    border: 2px solid black
    border-radius: 5px
    padding-top: 1.5rem
    display: flex
    flex-direction: column
    align-items: center
    margin-bottom: 2.5rem
    h4
      font-weight: bold
      font-size: 24px
      margin-bottom: 0
      font-family: Lato
    .next-step
      font-size: 24px
      font-weight: normal
      line-height: normal
      margin-bottom: 0.25rem
    .help
      font-size: 14px
      margin-bottom: 1rem
    .stages
      background-color: var(--pale-grey-eight)
      border-radius: 0 0 5px 5px
      width: 100%
      margin-top: 2rem
      display: flex
      justify-content: space-evenly
      height: 5rem
      align-items: center
      font-size: 14px
      color: var(--dark)
      font-weight: normal

`)
