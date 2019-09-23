import React from 'react'
import moment from 'moment'

import { vestingSchedule } from '@origin/token-transfer-server/src/lib/vesting'

const VestingHistory = props => {
  const schedule = {}
  props.grants.forEach(grant => {
    vestingSchedule(grant).forEach(vest => {
      const dateKey = vest.date.format()
      schedule[dateKey] = schedule[dateKey]
        ? schedule[dateKey].plus(vest.amount)
        : vest.amount
    })
  })

  const tableRows = []
  for (const [date, amount] of Object.entries(schedule)) {
    const momentDate = moment(date)
    tableRows.push(
      <tr key={date}>
        <td>
          <div
            className={`status-circle ${
              momentDate < moment.now() ? `status-circle-success` : ''
            }`}
          ></div>
        </td>
        <td>{Number(amount).toLocaleString()} OGN</td>
        <td>
          <small className="text-muted">
            {momentDate < moment.now() ? 'vested' : 'unvested'}
          </small>
        </td>
        <td>{momentDate.format('L')}</td>
      </tr>
    )
  }

  return (
    <>
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Vesting History</h2>
        </div>
      </div>
      <div className="row">
        <div className="table-card col">
          <table className="table mb-4">
            <tbody>
              {props.isLocked ? (
                <tr>
                  <td className="table-empty-cell" colSpan="100%">
                    Vesting has not yet started.
                    <br />
                    Please check back after Lockup Period ends.
                  </td>
                </tr>
              ) : (
                tableRows
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default VestingHistory
