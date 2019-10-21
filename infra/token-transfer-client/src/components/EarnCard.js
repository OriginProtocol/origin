import React from 'react'
import { NavLink } from 'react-router-dom'

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
        <div className="col"></div>
        <div className="col"></div>
      </div>
      <div className="row mb-2">
        <div className="col">
          <h2>Recent Lockups</h2>
        </div>
        <div className="col text-right">
          <NavLink to="/earn">View Details &gt;</NavLink>
        </div>
      </div>
    </BorderedCard>
  )
}

export default EarnCard
