import React from 'react'
import moment from 'moment'

import BorderedCard from './BorderedCard'
import LockupGraph from './LockupGraph'

const LockupCard = ({ lockup }) => {
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
          Unlocks in {moment(lockup.end).fromNow()}
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
          Lockup Amount
          <br />
          <strong>{Number(lockup.amount).toLocaleString()}</strong>{' '}
          <span className="ogn">OGN</span>
        </div>
        <div className="col-12 col-lg mb-3 mx-auto">
          <div
            className="status-circle status-circle-secondary"
            style={{ marginLeft: '-1.5rem', marginRight: '0.5rem' }}
          ></div>{' '}
          Bonus Tokens
          <br />
          <strong>{Number(lockup.amount).toLocaleString()}</strong>{' '}
          <span className="ogn">OGN</span>
        </div>
      </div>
    </BorderedCard>
  )
}

export default LockupCard
