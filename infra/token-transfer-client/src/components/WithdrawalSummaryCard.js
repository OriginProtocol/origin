import React from 'react'
import { NavLink } from 'react-router-dom'

import BorderedCard from '@/components/BorderedCard'

const WithdrawalSummaryCard = props => {
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
          {Number(props.vested).toLocaleString()}{' '}
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <div className="status-circle status-circle-error mr-2"></div>Total
          Withdrawn
        </div>
        <div className="col text-right">
          {Number(props.withdrawnAmount).toLocaleString()}{' '}
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <div className="status-circle status-circle-success mr-2"></div>Total
          Remaining
        </div>
        <div className="col text-right">
          {Number(props.vested.minus(props.withdrawnAmount)).toLocaleString()}{' '}
          <span className="ogn">OGN</span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalSummaryCard
