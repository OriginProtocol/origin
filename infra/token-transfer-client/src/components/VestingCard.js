import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'

const VestingCard = props => {
  return (
    <BorderedCard shadowed={true}>
      <VestingBars
        grants={props.grants}
        user={props.user}
        vested={props.vested}
        unvested={props.unvested}
      />
      <VestingHistory grants={props.grants} isLocked={props.isLocked} />
    </BorderedCard>
  )
}

export default VestingCard
