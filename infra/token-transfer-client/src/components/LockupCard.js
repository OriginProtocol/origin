import React from 'react'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import BorderedCard from './BorderedCard'
import LockupGraph from './LockupGraph'

const LockupCard = ({ lockup }) => {
  const now = moment.utc()

  return (
    <BorderedCard shadowed={true}>
      <div
        className="row text-center text-lg-left"
        style={{ alignItems: 'center' }}
      >
        <div className="mx-auto">
          <LockupGraph lockup={lockup} />
        </div>
        <div className="col-12 col-lg mb-3 mx-auto">
          <strong style={{ fontSize: '28px' }}>
            {Number(lockup.amount).toLocaleString()} OGN Lockup
          </strong>
          <br />
          Unlocks in {moment(lockup.end).diff(now, 'days')}d{' '}
          {moment(lockup.end).diff(now, 'hours') % 24}h{' '}
          {moment(lockup.end).diff(now, 'minutes') % 60}m
        </div>
        <div className="col-12 col-lg mb-3 mx-auto">
          Created
          <br />
          <strong>{moment(lockup.createdAt).format('LL')}</strong>
        </div>
        <div className="col-12 col-lg mb-3 mx-auto">
          <div
            className="status-circle status-circle-info"
            style={{ marginLeft: '-1.5rem', marginRight: '0.5rem' }}
          ></div>{' '}
          Lock up amount
          <br />
          <strong>{Number(lockup.amount).toLocaleString()}</strong>{' '}
          <span className="ogn">OGN</span>
        </div>
        <div className="col-12 col-lg mb-3 mx-auto">
          <div
            className="status-circle status-circle-secondary"
            style={{ marginLeft: '-1.5rem', marginRight: '0.5rem' }}
          ></div>{' '}
          Bonus tokens
          <br />
          <strong>
            {BigNumber((lockup.amount * lockup.bonusRate) / 100)
              .toFixed(0, BigNumber.ROUND_UP)
              .toLocaleString()}
          </strong>{' '}
          <span className="ogn">OGN</span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default LockupCard
