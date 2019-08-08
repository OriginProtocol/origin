import React from 'react'
import moment from 'moment'

const VestingBars = props => {
  if (!props.grants || props.grants.length === 0) {
    return null
  }

  const now = moment()
  // Momentize all the dates
  const grants = props.grants.map(grant => {
    return {
      ...grant,
      start: moment(grant.start),
      end: moment(grant.end),
      cancelled: grant.cancelled ? moment(grant.cancelled) : grant.cancelled
    }
  })

  const firstStartDate = moment(Math.min(...grants.map(g => g.start)))
  const lastEndDate = moment(Math.max(...grants.map(g => g.end)))
  const totalDuration = lastEndDate - firstStartDate

  const interim = firstStartDate.clone()
  const intermediateMonths = []
  while (
    lastEndDate > interim ||
    interim.format('M') === lastEndDate.format('M')
  ) {
    intermediateMonths.push(interim.format('YYYY-MM'))
    interim.add(1, 'month')
  }

  // Extract x points (months) across the duration to display between first
  // start date and last end date to display
  const maxPoints = 9
  const displayMonths = intermediateMonths.filter((e, i, arr) => {
    return i !== 0 && i !== arr.length - 1 && i % Math.floor(arr.length / maxPoints) === 0
  })

  return (
    <div className="vesting-bars-wrapper">
      <h2>Vesting Progress</h2>
      <div style={{ position: 'relative' }}>
        {grants.map(grant => {
          // Calculate the percentage of the grant that is complete with a
          // upper bound of 100
          const complete = Math.min(
            ((now - grant.start) / (grant.end - grant.start)) * 100,
            100
          )
          // Calculate the width of the grant relative to the width of the
          // total component
          const width = ((grant.end - grant.start) / totalDuration) * 100
          // Calculate the left indentation from the left side of the component
          const left = ((grant.start - firstStartDate) / totalDuration) * 100

          return (
            <div
              className="progress"
              key={grant.id}
              style={{ width: `${width}%`, marginLeft: `${left}%` }}
            >
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${complete}%` }}
              />
            </div>
          )
        })}
        {displayMonths.map(month => {
          const left = ((moment(month) - firstStartDate) / totalDuration) * 100
          const style = {
            position: 'absolute',
            left: `${left}%`,
            top: 0,
            height: '150%'
          }
          return (
            <div key={month} style={style}>
              <div
                style={{ borderLeft: '1px solid #dbe6eb', height: '100%' }}
              ></div>
              <div style={{ marginLeft: '-50%' }}>
                <small>{moment(month).format('MMM YYYY')}</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VestingBars

require('react-styl')(`
  .progress
    margin-top: 20px
  .vesting-bars-wrapper
    margin-bottom: 150px
`)
