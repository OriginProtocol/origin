import React from 'react'

const GrantDetail = props => (
  <>
    <div className="row">
      <div className="col">
        <h2 className="mb-4">Investment Details</h2>
      </div>
    </div>
    <div className="table-card" style={{ fontSize: '14px' }}>
      <div className="row mt-5 mb-5">
        <div className="col">
          <strong>Purchase Date</strong>
        </div>
        <div className="col">{props.grants[0].purchaseDate}</div>
      </div>
      <div className="row mb-5">
        <div className="col">
          <strong>Purchase Round</strong>
        </div>
        <div className="col">{props.grants[0].purchaseRound}</div>
      </div>
      <div className="row mb-5">
        <div className="col">
          <strong>Total Purchase</strong>
        </div>
        <div className="col">{props.grants[0].purchaseTotal}</div>
      </div>
      <div className="row mb-5">
        <div className="col">
          <strong>Investment Amount</strong>
        </div>
        <div className="col">{props.grants[0].investmentAmount}</div>
      </div>
    </div>
  </>
)

export default GrantDetail
