import React from 'react'

import { Doughnut } from 'react-chartjs-2'
import Lock from '-!react-svg-loader!@/assets/lock-icon.svg'

const LockupGraph = ({ percentage }) => {
  const doughnutData = () => {
    return {
      datasets: [
        {
          data: [percentage, 90],
          backgroundColor: ['#007cff', '#bdcbd5'],
          borderWidth: 2,
          borderDash: [10, 5]
        },
        {
          data: [percentage, 90],
          backgroundColor: ['#8900fd', '#bdcbd5'],
          borderWidth: 2
        }
      ]
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Doughnut
        data={doughnutData}
        options={{ cutoutPercentage: 60 }}
        legend={{ display: false }}
      />
      <Lock
        className="icon"
        style={{ position: 'absolute', top: '40%', left: '46%' }}
      />
    </div>
  )
}

export default LockupGraph
