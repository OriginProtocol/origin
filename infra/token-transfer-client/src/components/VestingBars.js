import React, { useState } from 'react'
import moment from 'moment'

const VestingBars = props => {
  const [displayPopover, setDisplayPopover] = useState({})

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

  const generateMarkers = () => {
    // Extract x points (months) across the duration to display between first
    // start date and last end date to display
    const maxMarkers = Math.floor(window.innerWidth / 200)
    const interim = firstStartDate.clone()
    const intermediateMonths = []
    while (
      lastEndDate > interim ||
      interim.format('M') === lastEndDate.format('M')
    ) {
      intermediateMonths.push(interim.format('YYYY-MM'))
      interim.add(1, 'month')
    }
    return intermediateMonths.filter((e, i, arr) => {
      return (
        i !== 0 &&
        i !== arr.length - 1 &&
        i % Math.floor(arr.length / maxMarkers) === 0
      )
    })
  }

  const handleTogglePopover = (event, grantId) => {
    // Calculate a left offset to make the popover display at the point of the
    // mouse click. This is calculating the offset of 3 parent relative elements.
    const leftOffset =
      document.getElementById('main').offsetLeft +
      document.getElementById('vestingBars').offsetParent.offsetLeft +
      document.getElementById('vestingBars').offsetLeft
    setDisplayPopover({
      ...displayPopover,
      [grantId]: displayPopover[grantId] ? false : event.clientX - leftOffset
    })
  }

  return (
    <div className="vesting-bars-wrapper">
      <h2>Vesting Progress</h2>
      <div id="vestingBars" style={{ position: 'relative' }}>
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
              onClick={event => handleTogglePopover(event, grant.id)}
            >
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${complete}%` }}
              />
              {displayPopover[grant.id] && (
                <div
                  className="popover"
                  style={{ left: `${displayPopover[grant.id]}px`, top: '10px' }}
                >
                  <div
                    className="cover"
                    onClick={event => handleTogglePopover(event, grant.id)}
                  />
                  <div>
                    <strong>Start</strong> {grant.start.format('YYYY-MM-DD')}
                  </div>
                  <div>
                    <strong>Cliff</strong> {grant.cliff.format('YYYY-MM-DD')}
                  </div>
                  <div>
                    <strong>End</strong> {grant.end.format('YYYY-MM-DD')}
                  </div>
                  <div>
                    <strong>Grant</strong> {grant.amount}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {generateMarkers().map(month => {
          const left = ((moment(month) - firstStartDate) / totalDuration) * 100
          const style = {
            position: 'absolute',
            left: `${left}%`,
            top: 0,
            height: '150%',
            pointerEvents: 'none' // Stop absolute positioning from stealing clicks
          }
          return (
            <div key={month} style={style}>
              <div
                style={{
                  borderLeft: '1px solid #dbe6eb',
                  height: '100%',
                  width: 0
                }}
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
  .vesting-bars-wrapper
    margin-bottom: 150px

  .progress
    margin-top: 20px
    cursor: pointer

  .cover
    position: fixed
    top: 0
    right: 0
    bottom: 0
    left: 0

  .popover
    position: absolute
    z-index: 2
    padding: 20px
    border-radius: 5px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.29);
    div
      margin-bottom: 2px
    strong
      width: 50px
      display: inline-block
`)
