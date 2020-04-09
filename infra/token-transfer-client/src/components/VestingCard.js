import React, { useContext } from 'react'

import { DataContext } from '@/providers/data'
import BorderedCard from '@/components/BorderedCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import VestingSchedule from '@/assets/schedule@3x.png'

const VestingCard = ({ isEmployee, user }) => {
  const data = useContext(DataContext)

  return (
    <BorderedCard style={{ minHeight: '100%' }}>
      <VestingBars user={user} />
      {data.config.isLocked && !isEmployee ? (
        <>
          <h2>Revised Vesting Schedule</h2>
          <p>
            The purple line shows the proposed amendment to the token release
            schedule.
          </p>
          <img src={VestingSchedule} className="img-fluid mx-auto mt-2" />
        </>
      ) : (
        <VestingHistory user={user} />
      )}
    </BorderedCard>
  )
}

export default VestingCard
