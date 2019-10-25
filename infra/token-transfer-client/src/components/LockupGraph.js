import React from 'react'
import moment from 'moment'

import { Doughnut } from 'react-chartjs-2'
import Lock from '-!react-svg-loader!@/assets/lock-icon.svg'

const LockupGraph = ({ lockup }) => {
  const totalDuration = moment(lockup.end).diff(moment(lockup.start))
  const remainingDuration = moment(lockup.end).diff(moment.utc())
  const percentage = (1 - remainingDuration / totalDuration) * 100

  const doughnutData = () => {
    return {
      datasets: [
        {
          label: 'Token Unlock',
          data: [percentage, 100 - percentage],
          backgroundColor: ['#007cff', 'rgba(0, 0, 0, 0)']
        },
        {
          label: 'Bonus Token Unlock',
          data: [percentage, 100 - percentage],
          backgroundColor: ['#8900fd', 'rgba(0, 0, 0, 0)']
        }
      ]
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '93px',
        width: '93px'
      }}
    >
      <Doughnut
        data={doughnutData}
        options={{
          cutoutPercentage: 60,
          responsive: false,
          tooltips: { enabled: false }
        }}
        legend={{ display: false }}
        width={93}
        height={93}
      />
      <Lock
        className="icon"
        style={{ position: 'absolute', top: '30px', left: '37px' }}
      />
    </div>
  )
}

export default LockupGraph
