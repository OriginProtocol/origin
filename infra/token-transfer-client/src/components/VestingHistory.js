import React from 'react'
import moment from 'moment'

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
        {props.isLocked ? (
          <div className="empty">
            Vesting has not yet started.
            <br />
            Please check back after Lockup Period ends.
          </div>
        ) : (
          vestingSchedule(props.grants[0]).map(currentVest => (
            <div className="row table-row" key={currentVest.date}>
              <div className="col-1">
                <div
                  className={`status-circle ${
                    currentVest.date < moment.now()
                      ? `status-circle-success`
                      : ''
                  }`}
                ></div>
              </div>
              <div className="col">
                {currentVest.amount.toLocaleString()} OGN
              </div>
              <div className="col">
                <small>
                  {currentVest.date < moment.now() ? 'vested' : 'unvested'}
                </small>
              </div>
              <div className="col" style={{ textAlign: 'right' }}>
                {currentVest.date.format('L')}
              </div>
            </div>
          ))
        )}
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
`)
