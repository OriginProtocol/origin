import React from 'react'

import { vestingSchedule } from '@origin/token-transfer-server/src/lib/vesting'

const VestingHistory = props => (
  <div className="table-card-wrapper">
    <div className="row header">
      <div className="col">
        <h2>Vesting History</h2>
      </div>
    </div>
    {props.grants.length > 0 && (
      <div className="table">
        {vestingSchedule(props.grants[0]).map(currentVest => (
          <div className="row table-row" key={currentVest.date}>
            <div className="col-1">
              <div className="status-circle"></div>
            </div>
            <div className="col">{currentVest.amount.toLocaleString()} OGN</div>
            <div className="col">
              <small>{currentVest.vested ? 'vested' : 'unvested'}</small>
            </div>
            <div className="col" style={{ textAlign: 'right' }}>
              {currentVest.date.format('L')}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default VestingHistory

require('react-styl')(`
  .header
    .col
      h2
        padding-bottom: 20px
        border-bottom: 1px solid #dbe6eb
  .status-circle
    width: 14px
    height: 14px
    border-radius: 7px
    margin-top: 4px
    background-color: #00db8d
  .table
    padding-top: 20px
    max-height: 300px
    overflow-y: scroll
  .table-row
    font-size: 14px
    margin-bottom: 20px
`)
