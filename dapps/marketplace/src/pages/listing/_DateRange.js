import React from 'react'

import dayjs from 'dayjs'
import { fbt } from 'fbt-runtime'

const DateRangeComponent = ({ startDate, endDate, hideIfEmpty, onClick }) => {
  if (hideIfEmpty && !startDate && !endDate) {
    return null
  }

  let startDateDisplay = fbt('Check in', 'Check in')
  let endDateDisplay = fbt('Check out', 'Check out')

  let startDateUnset = true
  let endDateUnset = true
  
  if (startDate) {
    startDateDisplay = dayjs(startDate).format('ddd, MMM D') // Needs l10n
    startDateUnset = false
  }

  if (endDate) {
    endDateDisplay = dayjs(endDate)
        .add(1, 'day')
        .format('ddd, MMM D') // Needs l10n
    endDateUnset = false
  }

  return (
    <div className="choose-dates form-control">
      <div className={`${startDateUnset ? '' : 'active'}`} onClick={onClick}>{startDateDisplay}</div>
      <div className="arr" />
      <div className={`${endDateUnset ? '' : 'active'}`} onClick={onClick}>{endDateDisplay}</div>
    </div>
  )
}

export default DateRangeComponent

require('react-styl')(`
  .choose-dates
    display: flex
    justify-content: space-between
    margin-bottom: 1rem
    padding-bottom: 1rem
    border: 0
    border-bottom: 1px solid #dde6ea
    border-radius: 0
    height: auto

    div:nth-child(1),div:nth-child(3)
      border-radius: var(--default-radius)
      padding: 0 5px
      cursor: pointer
      font-size: 22px
      line-height: 1
      flex: auto 0 0
      white-space: nowrap
      &.active
        color: #007fff

    div:nth-child(2)
      flex: 1
      background: url(images/arrow-right.svg) no-repeat center
      background-size: 1.25rem
    div:nth-child(3)
      text-align: right
`)