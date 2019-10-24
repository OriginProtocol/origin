import React from 'react'

import BorderedCard from './BorderedCard'
import LockupGraph from './LockupGraph'

const LockupCard = () => (
  <BorderedCard>
    <div className="row">
      <LockupGraph percentage={10} />
    </div>
  </BorderedCard>
)

export default LockupCard
