import dayjs from 'dayjs'
import React from 'react'

import Tooltip from 'components/Tooltip'

const dateFormat = timestamp => dayjs.unix(timestamp).format('MMM. D, YYYY')
const sentenceCase = (str) => (
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
)
const EventTick = ({ className, children, event }) => {
  const stageName = children
  const tickEl = <div className={className}>{stageName}</div>
  if(event == undefined) {
    return tickEl
  }
  const tip = (<div>
    <div>{sentenceCase(stageName)} on</div>
    <div><strong>{dateFormat(event.timestamp)}</strong></div>
  </div>)
  return <Tooltip tooltip={tip} placement="top">{tickEl}</Tooltip>
}

export default EventTick

require('react-styl')(`
.bs-tooltip-top
    .tooltip-inner
        background: var(--dark-grey-blue)
        max-width: 250px
        font-size: 0.8rem
        padding: 1.2rem
    .arrow::before
        border-top-color: var(--dark-grey-blue)
`)