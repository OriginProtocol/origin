import React, { useContext } from 'react'
import moment from 'moment'

import { Doughnut } from 'react-chartjs-2'
import { ThemeContext } from '@/providers/theme'
import LockIcon from '@/assets/lock-icon.svg'
import UnlockIcon from '@/assets/unlock-icon.svg'

const LockupGraph = ({ lockup, size = 60 }) => {
  const { theme } = useContext(ThemeContext)

  const totalDuration = moment(lockup.end).diff(moment(lockup.start))
  const remainingDuration = moment(lockup.end).diff(moment.utc())
  const percentage = Math.min(
    (1 - remainingDuration / totalDuration) * 100,
    100
  )

  const doughnutData = () => {
    return {
      datasets: [
        {
          label: 'Token Unlock',
          data: [percentage, 100 - percentage],
          backgroundColor: [
            percentage === 100 ? '#00db8d' : '#007cff',
            theme === 'light' ? '#dbe6eb' : '#061d2a'
          ],
          borderColor: theme === 'light' ? '#ffffff' : '#244159'
        },
        {
          label: 'Bonus Token Unlock',
          data: [percentage, 100 - percentage],
          backgroundColor: [
            percentage === 100 ? '#00db8d' : '#8900fd',
            theme === 'light' ? '#dbe6eb' : '#061d2a'
          ],
          borderColor: theme === 'light' ? '#ffffff' : '#244159'
        }
      ]
    }
  }

  const leftPosition = `${size / 2 - 14 / 2}px`
  const topPosition = `${size / 2 - 18 / 2}px`

  return (
    <div
      className="lockup-graph"
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <Doughnut
        data={doughnutData}
        options={{
          cutoutPercentage: 50,
          responsive: false,
          tooltips: { enabled: false }
        }}
        legend={{ display: false }}
        width={size}
        height={size}
      />
      {percentage === 100 ? (
        <UnlockIcon
          className="icon-green"
          style={{ position: 'absolute', top: topPosition, left: leftPosition }}
        />
      ) : (
        <LockIcon
          className="icon-blue"
          style={{ position: 'absolute', top: topPosition, left: leftPosition }}
        />
      )}
    </div>
  )
}

export default LockupGraph
