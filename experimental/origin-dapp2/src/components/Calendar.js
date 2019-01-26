import React, { Component } from 'react'
import dayjs from 'dayjs'

const resetDrag = {
  dragEnd: null,
  dragStart: null,
  dragging: false
}

class Calendar extends Component {
  state = {
    year: dayjs().year(),
    month: dayjs().month()
  }

  render() {
    const { year, month } = this.state,
      startOfMonth = new Date(year, month),
      date = dayjs(startOfMonth),
      isBeginning = date.isBefore(dayjs()),
      firstDay = date.day(),
      lastDay = date.endOf('month').date() + firstDay,
      max = lastDay <= 35 ? 35 : 42,
      days = []

    let currentDay = 1
    for (let i = 0; i <= max; i++) {
      if (i < lastDay && firstDay <= i) {
        days.push(currentDay++)
      } else {
        days.push(null)
      }
    }

    return (
      <div className="calendar">
        <div className="month-chooser">
          <button
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

        <div className="day-header">
          {'SMTWTFS'.split('').map((day, k) => (
            <div key={k}>{day}</div>
          ))}
        </div>

        <div className={`days${this.state.dragging ? '' : ' inactive'}`}>
          {Array(max)
            .fill(0)
            .map((v, idx) => this.renderDay(days, idx, lastDay))}
        </div>
      </div>
    )
  }

  onChange() {
    if (!this.state.dragging) {
      this.props.onChange({ rangeSelected: true })
    }
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

    const date = dayjs(new Date(this.state.year, this.state.month, day))
    const dayOfWeek = date.day()
    const weekend = dayOfWeek === 6 || dayOfWeek === 5
    const dayPrice = weekend ? this.props.weekendPrice : this.props.weekdayPrice

    if (date.add(1, 'day').isBefore(dayjs())) {
      return (
        <div
          key={idx}
          className={`day in-past${idx % 7 === 6 ? ' end-row' : ''}`}
        >
          <div>{days[idx]}</div>
        </div>
      )
    }

    return (
      <div
        key={idx}
        className={`day ${this.getClass(idx, lastDay)}`}
        onMouseDown={() => {
          let newState
          if (this.state.dragging) {
            newState = { dragEnd: idx, dragging: false }
          } else {
            newState = {
              dragging: true,
              dragStart: idx,
              dragEnd: null
            }
          }
          this.setState(newState, () => this.onChange())
        }}
        onMouseOver={() => this.setState({ dragOver: idx })}
      >
        <div>{days[idx]}</div>
        <div>{`${dayPrice} ETH`}</div>
      </div>
    )
  }

  getClass(idx, lastDay) {
    const initStart = this.state.dragStart,
      initEnd = this.state.dragging ? this.state.dragOver : this.state.dragEnd,
      start = initStart < initEnd ? initStart : initEnd,
      end = initStart < initEnd ? initEnd : initStart

    let cls = 'active'

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
    }
    if (idx % 7 === 6 || idx === lastDay - 1) {
      cls += ' end-row'
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
      grid-template-columns: repeat(7, 1fr);
      user-select: none
      > .empty.first-row
        border-bottom: 1px solid #c2cbd3
      > .day
        height: 6vw
        min-height: 3.5rem
        color: #455d75
        font-size: 14px
        font-weight: normal
        padding: 0.25rem 0.5rem
        display: flex
        flex-direction: column;
        justify-content: space-between;
        min-width: 0

        border-style: solid
        border-color: #c2cbd3
        border-width: 0 0 1px 1px
        position: relative
        &.end-row
          border-right-width: 1px

        &.in-past
          background-color: var(--pale-grey)

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
        &.start,&.mid,&.end
          background-color: var(--pale-clear-blue)
        &.start::after
          border-width: 3px 0 3px 3px
          border-color: black
        &.mid::after
          border-width: 3px 0 3px 0
          border-color: black
        &.end::after
          border-width: 3px 3px 3px 0
          border-color: black
        &.single::after
          border-width: 3px
          border-color: black
      &.inactive > div:hover
        &.start::after, &.end::after, &.mid::after
          border-color: blue
          border-width: 3px
          z-index: 3

    .day-header
      display: flex
      border-width: 1px 0
      border-style: solid
      border-color: #c2cbd3
      justify-content: space-between;
      text-align: center
      font-size: 14px
      font-weight: normal
      color: var(--bluey-grey)
      margin-top: 1rem;
      line-height: 2rem;
      > div
        flex: 1

    .month-chooser
      display: flex
      justify-content: space-between;
      font-family: Poppins
      font-size: 24px
      font-weight: 300
      .btn
        border-color: #c2cbd3
        &::before
          content: "";
          width: 0.75rem;
          height: 0.75rem;
          border-width: 0 0 1px 1px;
          border-color: #979797;
          border-style: solid;
          transform: rotate(45deg) translate(3px, -1px)
          display: inline-block;
        &.next::before
          transform: rotate(225deg) translate(1px, -2px)
        &:hover::before
          border-color: var(--white)
`)
