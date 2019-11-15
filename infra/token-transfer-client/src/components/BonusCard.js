import React from 'react'
import { NavLink } from 'react-router-dom'

import BorderedCard from '@/components/BorderedCard'
import Lock from '-!react-svg-loader!@/assets/lock-icon.svg'
import LockupGraph from './LockupGraph'
import OgnTokens from '-!react-svg-loader!@/assets/ogn-tokens.svg'

const BonusCard = ({ earnings, isLocked, locked, lockups }) => {
  const renderLockupGraphs = lockups => {
    return lockups.slice(0, 3).map(lockup => {
      return (
        <div className="ml-2 my-2" key={lockup.id}>
          <LockupGraph lockup={lockup} />
        </div>
      )
    })
  }

  if (isLocked) {
    return (
      <BorderedCard shadowed={true}>
        <div className="text-center">
          <OgnTokens />
          <h1 className="mt-3 mb-1">Earn Bonus Tokens</h1>
          <p>
            Place your vested tokens into lockup periods to earn even more OGN.
          </p>
        </div>
      </BorderedCard>
    )
  }

  return (
    <BorderedCard shadowed={true}>
      <div className="row mb-2">
        <div className="col">
          <h2>Bonus Tokens</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/lockup">Earn More &gt;</NavLink>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <strong style={{ fontSize: '24px' }}>
            {earnings.toLocaleString()}
          </strong>{' '}
          <span className="ml-1 ogn">OGN</span>
          <div>Earned</div>
        </div>
        <div className="col">
          <strong style={{ fontSize: '24px' }}>
            {locked.toLocaleString()}
          </strong>{' '}
          <span className="ml-1 ogn">OGN</span>
          <div>Locked Up</div>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <h2>Recent Lockups</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/lockup">View Details &gt;</NavLink>
        </div>
      </div>
      <div className="row">
        {lockups && lockups.length > 0 ? (
          renderLockupGraphs(lockups)
        ) : (
          <div className="col text-center text-muted p-4">
            <div className="mb-3">
              <Lock className="icon" />
            </div>
            You don&apos;t have any OGN locked up.
          </div>
        )}
      </div>
    </BorderedCard>
  )
}

export default BonusCard
