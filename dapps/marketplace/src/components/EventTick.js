import dayjs from 'dayjs'
import displayDateTime from 'utils/displayDateTime'
import React from 'react'

import Tooltip from 'components/Tooltip'

const displayEventDate = timestamp =>
  displayDateTime(dayjs.unix(timestamp), {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
const sentenceCase = str =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const EventTick = ({ className, children, event }) => {
  const stageName = children
  const tickEl = <div className={className}>{stageName}</div>
  if (!event || !event.timestamp) {
    return tickEl
  }
  const tip = (
    <div>
      <div>{sentenceCase(stageName)} on</div>
      <div>
        <strong>{displayEventDate(event.timestamp)}</strong>
      </div>
    </div>
  )
  return (
    <Tooltip tooltip={tip} placement="top" className="progress-tooltip">
      {tickEl}
    </Tooltip>
  )
}

export default EventTick

require('react-styl')(`
  .progress-tooltip
    .tooltip-inner
      background: var(--dark-grey-blue)
      max-width: 250px
      font-size: 0.75rem
      padding: 0.5rem
    .arrow::before
      border-top-color: var(--dark-grey-blue)
  `)
