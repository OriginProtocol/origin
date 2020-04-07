import React from 'react'

import LockIcon from '@/assets/lock-icon.svg'

const BonusGraph = ({ lockupAmount, bonusRate }) => {
  const formatToken = n => {
    if (n < 1e3) return n.toLocaleString()
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K'
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M'
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B'
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T'
  }

  const bonusAmount = lockupAmount * (bonusRate / 100)

  return (
    <div>
      <div className="bonus-graph-legend">
        <div className="row">
          <div className="col-7">
            <div className="bonus-graph-legend-blue">&nbsp;</div>
            <strong>Lock up amount</strong>
          </div>
          <div className="col text-right">
            <strong>{Number(lockupAmount).toLocaleString()} OGN</strong>
          </div>
        </div>

        <div className="row">
          <div className="col-7">
            <div className="bonus-graph-legend-purple">&nbsp;</div>
            <strong>Bonus Tokens</strong> ({bonusRate}%)
          </div>
          <div className="col text-right">
            <strong>{Number(bonusAmount).toLocaleString()} OGN</strong>
          </div>
        </div>
      </div>

      <div className="bonus-graph-wrapper">
        <div className="bonus-graph-blue">
          <div className="bonus-graph-amount">{formatToken(lockupAmount)}</div>
          <div className="bonus-graph-lock">
            <LockIcon
              className="icon-white"
              style={{
                transform: 'scale(0.6)',
                marginTop: '-8px',
                marginLeft: '4px'
              }}
            />
          </div>
        </div>

        <div className="bonus-graph-purple">
          <div className="bonus-graph-amount">{formatToken(bonusAmount)}</div>
          <div className="bonus-graph-lock">
            <LockIcon
              className="icon-white"
              style={{
                transform: 'scale(0.6)',
                marginTop: '-8px',
                marginLeft: '4px'
              }}
            />
          </div>
        </div>

        <div className="bonus-graph-label bonus-graph-y-label">OGN Amount</div>
        <div className="bonus-graph-label bonus-graph-start-label">Today</div>
        <div className="bonus-graph-label bonus-graph-end-label">1 Year</div>
      </div>
    </div>
  )
}

export default BonusGraph
