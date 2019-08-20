import React from 'react'

import BorderedCard from '@/components/BorderedCard'

const WithdrawalHistoryCard = props => {
  return (
    <BorderedCard shadowed={true}>
      <div className="row">
        <div className="col">
          Available Balance{' '}
          <strong className="ml-2">
            {props.isLocked ? 0 : Number(props.vestedTotal).toLocaleString()}
          </strong>{' '}
          <span className="ogn" style={{ fontSize: '14px' }}>
            OGN
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <small>
            Total Withdrawn: {props.withdrawnAmount.toLocaleString()} OGN
          </small>
        </div>
        <div className="col">
          <small>Unvested: {props.unvestedTotal.toLocaleString()} OGN</small>
        </div>
        <div className="col">
          <small>Total Purchase: {props.grantTotal.toLocaleString()} OGN</small>
        </div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalHistoryCard
