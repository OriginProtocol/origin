import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import VestingSchedule from '@/assets/schedule@3x.png'

const VestingCard = props => {
  return (
    <BorderedCard shadowed={true} style={{ minHeight: '100%' }}>
      <VestingBars
        grants={props.grants}
        user={props.user}
        vested={props.vested}
        unvested={props.unvested}
        isLocked={props.isLocked}
      />
      {props.isLocked ? (
        <>
          <h2>Revised Vesting Schedule</h2>
          <p>
            The purple line shows the proposed amendment to the token release
            schedule.
          </p>
          <img src={VestingSchedule} className="img-fluid mx-auto mt-2" />
        </>
      ) : (
        <VestingHistory
          grants={props.grants}
          user={props.user}
          isLocked={props.isLocked}
        />
      )}
    </BorderedCard>
  )
}

export default VestingCard
