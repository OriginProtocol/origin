import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import VestingSchedule from '@/assets/vesting-schedule@3x.png'

const VestingCard = props => {
  return (
    <BorderedCard shadowed={true}>
      <VestingBars
        grants={props.grants}
        user={props.user}
        vested={props.vested}
        unvested={props.unvested}
      />
      {props.isLocked ? (
        <>
          <h2>Revised Vesting Schedule</h2>
          <p>The purple line shows how your tokens will vest over 2 years.</p>
          <img src={VestingSchedule} className="img-fluid mx-auto mt-2" />
        </>
      ) : (
        <VestingHistory grants={props.grants} isLocked={props.isLocked} />
      )}
    </BorderedCard>
  )
}

export default VestingCard
