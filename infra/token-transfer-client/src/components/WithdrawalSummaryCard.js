import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'

import { DataContext } from '@/providers/data'
import { ThemeContext } from '@/providers/theme'
import BorderedCard from '@/components/BorderedCard'

const WithdrawalSummaryCard = ({ onDisplayWithdrawModal }) => {
  const data = useContext(DataContext)
  const { theme } = useContext(ThemeContext)

  const total = Number(data.totals.vested)
  const withdrawnPercent = (Number(data.totals.withdrawn) / total) * 100
  const remainingPercent = 100 - withdrawnPercent

  return (
    <BorderedCard>
      <div className="row mb-2">
        <div className="col">
          <h2>Withdrawals</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/withdrawal">View History &gt;</NavLink>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col text-muted">Vested To Date</div>
        <div className="col text-right">
          <strong>{Number(data.totals.vested).toLocaleString()} </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col text-nowrap text-muted">
          <div className="status-circle bg-red mr-2"></div>Total Withdrawn
        </div>
        <div className="col text-right">
          <strong>{Number(data.totals.withdrawn).toLocaleString()} </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col text-nowrap text-muted">
          <div className="status-circle bg-green mr-2"></div>Total Remaining
        </div>
        <div className="col text-right">
          <strong>
            {Number(
              data.totals.vested.minus(data.totals.withdrawn)
            ).toLocaleString()}{' '}
          </strong>
          <span className="ogn">OGN</span>
        </div>
      </div>
      <div className="progress mt-4" style={{ height: '5px' }}>
        <div
          className="progress-bar bg-green"
          role="progressbar"
          style={{ width: `${remainingPercent}%` }}
        ></div>
        <div
          className="progress-bar bg-danger"
          role="progressbar"
          style={{ width: `${withdrawnPercent}%` }}
        ></div>
      </div>
      {!data.config.isLocked && (
        <div className="row mt-5">
          <div className="col text-center">
            <button
              className={`btn btn-lg btn-outline-${
                theme === 'dark' ? 'light' : 'primary'
              }`}
              onClick={onDisplayWithdrawModal}
            >
              Withdraw
            </button>
          </div>
        </div>
      )}
    </BorderedCard>
  )
}

export default WithdrawalSummaryCard
