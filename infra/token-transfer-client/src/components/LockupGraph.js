import React, { useContext } from 'react'
import moment from 'moment'

import { Doughnut } from 'react-chartjs-2'
import { ThemeContext } from '@/providers/theme'
import LockIcon from '@/assets/lock-icon.svg'
import UnlockIcon from '@/assets/unlock-icon.svg'

const LockupGraph = ({ lockup }) => {
  const { theme } = useContext(ThemeContext)

  const totalDuration = moment(lockup.end).diff(moment(lockup.start))
  const remainingDuration = moment(lockup.end).diff(moment.utc())
  const percentage = Math.min((1 - remainingDuration / totalDuration) * 100, 100)

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

  return (
    <div
      className="lockup-graph"
      style={{
        position: 'relative',
        width: '93px',
        height: '93px',
        display: 'inline-block'
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
      {percentage === 100 ? (
        <UnlockIcon
          className="icon-green"
          style={{ position: 'absolute', top: '35px', left: '40px', transform: 'scale(1.5)' }}
        />
      ) : (
        <LockIcon
          className="icon-blue"
          style={{ position: 'absolute', top: '35px', left: '40px', transform: 'scale(1.5)' }}
        />
      )}
    </div>
  )
}

export default LockupGraph
