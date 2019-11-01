import React from 'react'
import { NavLink } from 'react-router-dom'

import BorderedCard from '@/components/BorderedCard'

const WithdrawalSummaryCard = props => {
  const total = Number(props.vested)
  const withdrawnPercent = (Number(props.withdrawnAmount) / total) * 100
  const remainingPercent = 100 - withdrawnPercent
  return (
    <BorderedCard shadowed={true}>
      <div className="row mb-2">
        <div className="col">
          <h2>Withdrawals</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/withdrawal">View history &gt;</NavLink>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">Vested tokens to date</div>
        <div className="col text-right">
          <strong>{Number(props.vested).toLocaleString()} </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <div className="status-circle status-circle-error mr-2"></div>Total
          Withdrawn
        </div>
        <div className="col text-right">
          <strong>{Number(props.withdrawnAmount).toLocaleString()} </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <div className="status-circle status-circle-success mr-2"></div>Total
          Remaining
        </div>
        <div className="col text-right">
          <strong>
            {Number(props.vested.minus(props.withdrawnAmount)).toLocaleString()}{' '}
          </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="progress mt-4" style={{ height: '5px' }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${remainingPercent}%` }}
        ></div>
        <div
          className="progress-bar bg-error"
          role="progressbar"
          style={{ width: `${withdrawnPercent}%` }}
        ></div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalSummaryCard
