import React from 'react'

import BorderedCard from '@/components/BorderedCard'

const WithdrawalHistoryCard = props => {
  return (
    <BorderedCard>
      <div className="row">
        <div className="col mb-2" style={{ fontSize: '18px' }}>
          Available Balance{' '}
          <strong className="ml-1">
            {props.isLocked
              ? 0
              : Number(
                  props.vestedTotal.minus(props.withdrawnAmount)
                ).toLocaleString()}
          </strong>{' '}
          <span className="ogn" style={{ fontSize: '14px', color: '#007cff' }}>
            OGN
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Total Withdrawn:{' '}
            <span className="text-nowrap">
              {Number(props.withdrawnAmount).toLocaleString()}{' '}
            </span>
            OGN
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Unvested:{' '}
            <span className="text-nowrap">
              {Number(props.unvestedTotal).toLocaleString()} OGN
            </span>
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Total Purchase:{' '}
            <span className="text-nowrap">
              {Number(props.grantTotal).toLocaleString()} OGN
            </span>
          </span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalHistoryCard
