import React from 'react'

import { Doughnut } from 'react-chartjs-2'
import Lock from '-!react-svg-loader!@/assets/lock-icon.svg'

const LockupGraph = ({ percentage }) => {
  const doughnutData = () => {
    return {
      datasets: [
        {
          data: [percentage, 100 - percentage],
          backgroundColor: ['#007cff', 'rgba(0, 0, 0, 0)']
        },
        {
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
        options={{ cutoutPercentage: 60, responsive: false }}
        legend={{ display: false }}
        width="93"
        height="93"
      />
      <Lock
        className="icon"
        style={{ position: 'absolute', top: '30px', left: '37px' }}
      />
    </div>
  )
}

export default LockupGraph
