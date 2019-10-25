import React from 'react'

import BorderedCard from '@/components/BorderedCard'

const WithdrawalHistoryCard = props => {
  return (
    <BorderedCard shadowed={true}>
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
            Total Withdrawn: {Number(props.withdrawnAmount).toLocaleString()}{' '}
            OGN
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Unvested: {Number(props.unvestedTotal).toLocaleString()} OGN
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Total Purchase: {Number(props.grantTotal).toLocaleString()} OGN
          </span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalHistoryCard
