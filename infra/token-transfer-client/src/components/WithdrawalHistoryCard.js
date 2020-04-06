import React, { useContext } from 'react'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'

const WithdrawalHistoryCard = () => {
  const data = useContext(DataContext)

  return (
    <BorderedCard shadowed={true}>
      <div className="row">
        <div className="col mb-2" style={{ fontSize: '18px' }}>
          Available Balance{' '}
          <strong className="ml-1">
            {data.config.isLocked
              ? 0
              : Number(
                  data.totals.vested.minus(data.totals.withdrawn)
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
              {Number(data.totals.withdrawn).toLocaleString()}
            </span>
            OGN
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Unvested:{' '}
            <span className="text-nowrap">
              {Number(data.totals.unvested).toLocaleString()} OGN
            </span>
          </span>
        </div>
        <div className="col-12 col-md-4">
          <span className="text-muted">
            Total Purchase:{' '}
            <span className="text-nowrap">
              {Number(data.totals.granted).toLocaleString()} OGN
            </span>
          </span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default WithdrawalHistoryCard
