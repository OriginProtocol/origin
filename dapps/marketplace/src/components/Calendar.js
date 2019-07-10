import React, { Component } from 'react'
import dayjs from 'dayjs'

import Price from 'components/Price'

const resetDrag = {
  dragEnd: null,
  dragStart: null,
  dragging: false
}

class Calendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      year: dayjs().year(),
      month: dayjs().month()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.range && !this.props.range) {
      this.setState({ ...resetDrag })
    }
  }

  render() {
    const { year, month } = this.state,
      startOfMonth = new Date(year, month),
      date = dayjs(startOfMonth),
      isBeginning = date.isBefore(dayjs()),
      firstDay = date.day(),
      lastDay = date.endOf('month').date() + firstDay,
      max = lastDay <= 35 ? 35 : 42,
      days = [],
      dayAvailability = this.props.availability.getAvailability(
        date.format('YYYY-MM-DD'),
        date.endOf('month').format('YYYY-MM-DD')
      )

    let currentDay = 0
    for (let i = 0; i <= max; i++) {
      if (i < lastDay && firstDay <= i) {
        days.push(dayAvailability[currentDay++])
      } else {
        days.push(null)
      }
    }

    return (
      <div className={`calendar${this.props.small ? ' calendar-sm' : ''}`}>
        <div className="month-chooser">
          <button
            type="button"
            className={`btn btn-outline-secondary prev${
              isBeginning ? ' disabled' : ''
            }`}
            onClick={() => {
              if (isBeginning) {
                return
              }
              if (month === 0) {
                this.setState({ month: 11, year: year - 1, ...resetDrag })
              } else {
                this.setState({ month: month - 1, ...resetDrag })
              }
            }}
          />
          {date.format('MMMM YYYY')}
          <button
            type="button"
            className="btn btn-outline-secondary next"
            onClick={() => {
              if (month === 11) {
                this.setState({ month: 0, year: year + 1, ...resetDrag })
              } else {
                this.setState({ month: this.state.month + 1, ...resetDrag })
              }
            }}
          />
        </div>

        <div className={`days${this.state.dragging ? '' : ' inactive'}`}>
          {Array(max)
            .fill(0)
            .map((v, idx) => this.renderDay(days, idx, lastDay))}
        </div>
      </div>
    )
  }

  renderDay(days, idx, lastDay) {
    const day = days[idx]
    if (!day) {
      return (
        <div
          key={idx}
          className={`empty ${idx < 7 ? 'first-row' : 'last-row'}`}
        />
      )
    }

    const date = dayjs(day.date)

    if (date.add(1, 'day').isBefore(dayjs())) {
      return (
        <div
          key={idx}
          className={`day in-past${idx % 7 === 6 ? ' end-row' : ''}`}
        >
          <div>{date.date()}</div>
        </div>
      )
    }

    let content = (
      <Price
        price={{ amount: day.price, currency: this.props.currency }}
        target={this.props.originalCurrency ? this.props.currency : null}
      />
    )
    if (day.booked && this.props.showBooked) {
      content = 'Booked'
    } else if (day.unavailable) {
      content = null
    } else if (day.customPrice) {
      content = <span className="custom-price">{content}</span>
    }

    let interactions = {}
    if (this.props.interactive !== false) {
      interactions = {
        onClick: () => {
          let startDate = day.date
          if (this.state.dragging) {
            startDate = this.state.startDate
            this.setState({ dragEnd: idx, dragging: false, endDate: day.date })
          } else {
            this.setState({
              dragging: true,
              dragStart: idx,
              startDate,
              dragEnd: idx,
              endDate: startDate
            })
          }
          if (this.props.onChange) {
            const start = dayjs(startDate)
            let range = `${startDate}/${day.date}`
            if (start.isAfter(day.date)) {
              range = `${day.date}/${startDate}`
            }
            this.props.onChange({ range })
          }
        },
        onMouseOver: () => this.setState({ dragOver: idx })
      }
    }

    return (
      <div
        key={idx}
        className={`day ${this.getClass(idx, lastDay, day)}`}
        {...interactions}
      >
        <div>{date.date()}</div>
        <div className="day-meta">{content}</div>
      </div>
    )
  }

  getClass(idx, lastDay, day) {
    const initStart = this.state.dragStart,
      initEnd = this.state.dragging ? this.state.dragOver : this.state.dragEnd,
      start = initStart < initEnd ? initStart : initEnd,
      end = initStart < initEnd ? initEnd : initStart

    let cls = this.props.interactive === false ? '' : 'active',
      unselected = false

    if (idx === start && idx === end) {
      cls += ' single'
    } else if (idx === start) {
      cls += ' start'
    } else if (idx === end) {
      cls += ' end'
    } else if (idx > start && idx < end) {
      cls += ' mid'
    } else {
      cls += ' unselected'
      unselected = true
    }
    if (idx % 7 === 6 || idx === lastDay - 1) {
      cls += ' end-row'
    }
    if (!unselected && idx + 7 >= start && idx + 7 <= end) {
      cls += ' nbb'
    }
    if (!unselected && idx - 7 >= start && idx - 7 <= end) {
      cls += ' nbt'
    }
    if (day.unavailable || day.booked) {
      cls += ' unavailable'
    }

    return cls
  }
}

export default Calendar

require('react-styl')(`
  .calendar
    margin-bottom: 2rem
    .days
      display: grid
      grid-template-columns: repeat(7, 1fr)
      user-select: none
      max-width: 17.5rem
      margin-left: auto
      margin-right: auto
      grid-row-gap: 5px
      > .day
        height: 2.5rem
        width: 2.5rem
        color: #6a8296
        font-size: 14px
        font-weight: normal
        padding: 0.25rem 0.5rem
        display: flex
        flex-direction: column
        justify-content: space-between

        position: relative
        text-align: center

        .day-meta
          font-size: 8px
          .custom-price
            color: green

        &.end-row
          border-right-width: 1px

        &.in-past,&.unavailable
          text-decoration: line-through
          color: var(--light)
        &.unavailable
          div:nth-child(2)
            color: var(--light)

        > div:nth-child(2)
          font-weight: bold
          white-space: nowrap
          overflow: hidden
        &::after
          z-index: 1
          content: ""
          position: absolute
          border: 3px solid transparent
          top: -2px
          left: -2px
          right: -2px
          bottom: -2px
        &.active::after
          cursor: pointer
        &.active.unselected:hover
          &::after
            border: 3px solid black
        &.start, &.mid, &.end
          background-color: #007fff
          color: var(--white)
          .day-meta .custom-price
            color: var(--white)
        &.start
          border-top-left-radius: 10px
          border-bottom-left-radius: 10px
        &.end
          border-top-right-radius: 10px
          border-bottom-right-radius: 10px
        &.single
          border-radius: 10px
          background-color: #007fff
          color: var(--white)

    .day-header
      display: flex
      border-width: 1px 0
      border-style: solid
      border-color: #c2cbd3
      justify-content: space-between
      text-align: center
      font-size: 14px
      font-weight: normal
      color: var(--bluey-grey)
      margin-top: 1rem
      line-height: 2rem
      > div
        flex: 1

    .month-chooser
      display: flex
      justify-content: space-between
      font-family: var(--heading-font)
      font-size: 24px
      font-weight: 300
      margin-bottom: 1rem
      .btn
        border-color: #c2cbd3
        min-width: auto
        &::before
          content: ""
          width: 0.75rem
          height: 0.75rem
          border-width: 0 0 1px 1px
          border-color: #979797
          border-style: solid
          transform: rotate(45deg) translate(3px, -1px)
          display: inline-block
        &.next::before
          transform: rotate(225deg) translate(1px, -2px)
        &:hover::before
          border-color: var(--white)
`)
