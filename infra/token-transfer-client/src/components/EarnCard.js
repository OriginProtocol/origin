import React from 'react'
import { NavLink } from 'react-router-dom'

import Lock from '-!react-svg-loader!@/assets/lock-icon.svg'
import BorderedCard from '@/components/BorderedCard'

const EarnCard = () => {
  return (
    <BorderedCard shadowed={true}>
      <div className="row mb-2">
        <div className="col">
          <h2>Earn OGN</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/earn">Earn More &gt;</NavLink>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <strong style={{ fontSize: '24px' }}>0</strong> <span className="ml-1 ogn">OGN</span>
          <div className="mt-1">
            Earned
          </div>
        </div>
        <div className="col">
          <strong style={{ fontSize: '24px' }}>0</strong> <span className="ml-1 ogn">OGN</span>
          <div className="mt-1">
            Locked up
          </div>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <h2>Recent Lockups</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/earn">View Details &gt;</NavLink>
        </div>
      </div>
      <div className="row">
        <div className="col text-center text-muted p-4">
          <div className="mb-3">
            <Lock className="icon" />
          </div>
          You have not locked up any tokens
        </div>
      </div>
    </BorderedCard>
  )
}

export default EarnCard
