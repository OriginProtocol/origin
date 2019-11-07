import React from 'react'

import BorderedCard from '@/components/BorderedCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import VestingSchedule from '@/assets/vesting-schedule@3x.png'
import Calendar from '-!react-svg-loader!@/assets/cal.svg'

const VestingCard = props => {
  // Special case during lockup period for CoinList investors while the
  // token vesting schedule is finalised
  const isRejectedCoinList =
    props.user &&
    props.isLocked &&
    props.user.investorType === 'CoinList' &&
    props.user.revisedScheduleRejected

  if (isRejectedCoinList) {
    return (
      <BorderedCard shadowed={true}>
        <div className="text-center" style={{ padding: '5.7rem 0' }}>
          <Calendar />
          <h1 className="mt-3 mb-1">Vesting schedule in progress</h1>
          <p>
            Details of the schedule are still being worked out, please check
            back later.
          </p>
        </div>
      </BorderedCard>
    )
  }

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
          {props.user.investorType === 'CoinList' ? (
            <p>
              The purple line shows the proposed amendment to the token release
              schedule.
            </p>
          ) : (
            <p>The purple line shows how your tokens will vest over 2 years.</p>
          )}
          <img src={VestingSchedule} className="img-fluid mx-auto mt-2" />
        </>
      ) : (
        <VestingHistory grants={props.grants} isLocked={props.isLocked} />
      )}
    </BorderedCard>
  )
}

export default VestingCard
