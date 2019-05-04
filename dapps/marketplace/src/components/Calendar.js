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
      month: dayjs().month(),
      days: []
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.range && !this.props.range) {
      this.setState({ ...resetDrag })
    }
  }

  componentDidMount = () => {
    window.addEventListener('mouseup', this.onWindowSelectEnd)
    window.addEventListener('touchend', this.onWindowSelectEnd)
    window.addEventListener('touchmove', this.preventScrollHack, { passive: false })
  }

  componentWillUnmount = () => {
    window.removeEventListener('mouseup', this.onWindowSelectEnd)
    window.removeEventListener('touchend', this.onWindowSelectEnd)
    window.removeEventListener('touchmove', this.preventScrollHack)
  }

  preventScrollHack = e => {
    // An ugly hack to prevent page-scroll
    // when drag-selecting vertically
    if (this.state.dragging) {
      e.preventDefault()
      return false
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

    this.state.days = days

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

        <div className="day-header">
          {'SMTWTFS'.split('').map((day, k) => (
            <div key={k}>{day}</div>
          ))}
        </div>

        <div className={`days${this.state.dragging ? '' : ' inactive'}`}>
          {Array(max)
            .fill(0)
            .map((v, idx) => (
              <DaySlot
                key={idx}
                day={days[idx]}
                showBooked={this.props.showBooked}
                interactive={this.props.interactive}
                originalCurrency={this.props.originalCurrency}
                currency={this.props.currency}
                cellIndex={idx}
                className={this.getClass(idx, lastDay, days[idx])}
                onSelectStart={this.onCellSelectStart}
                onSelectMove={this.onCellSelectMove}
              />
            ))}
        </div>
      </div>
    )
  }

  onCellSelectStart = e => {
    const isLeftClick = e.button === 0
    const isTouch = e.type !== 'mousedown'

    if (!this.state.dragging && (isLeftClick || isTouch)) {
      e.preventDefault()

      const cellIndex = parseInt(e.target.getAttribute('cellindex'))

      this.setState({
        dragging: true,
        dragStart: cellIndex,
        dragEnd: cellIndex,
        dragOver: cellIndex,
        startDate: this.state.days[cellIndex].date,
        endDate: this.state.days[cellIndex].date
      })
    }
  }

  onCellSelectMove = e => {
    if (this.state.dragging) {
      e.preventDefault()

      const cellIndex = this.getCellIndexFromEvent(e)
      const day = this.state.days[cellIndex]

      if (day && !day.unavailable && !day.booked) {
        this.setState({
          dragOver: cellIndex,
          dragEnd: cellIndex,
          endDate: day.date
        })
      }
    }
  }

  onWindowSelectEnd = e => {
    const isLeftClick = e.button === 0
    const isTouch = e.type !== 'mousedown'

    if (this.state.dragging && (isLeftClick || isTouch)) {
      this.setState({
        dragging: false
      })

      if (this.props.onChange) {
        const day = this.state.days[this.state.dragEnd]

        const start = dayjs(this.state.startDate)
        let range = `${this.state.startDate}/${day.date}`
        if (start.isAfter(day.date)) {
          range = `${day.date}/${this.state.startDate}`
        }
        this.props.onChange({ range })
      }
    }
  }

  getCellIndexFromEvent = e => {
    let target
    if (e.type === 'touchmove' && e.touches) {
      const touch = e.touches.item(0)
      target = document.elementFromPoint(touch.clientX, touch.clientY)
    } else {
      target = e.target
      while (target.classList && !target.classList.contains('day')) {
        target = target.parentNode
      }
    }

    return target && target.hasAttribute('cellindex')
      ? parseInt(target.getAttribute('cellindex'))
      : null
  }

  getClass(idx, lastDay, day) {
    if (!day) {
      return `empty ${idx < 7 ? 'first-row' : 'last-row'}`
    }

    if (
      dayjs(day.date)
        .add(1, 'day')
        .isBefore(dayjs())
    ) {
      return `day in-past${idx % 7 === 6 ? ' end-row' : ''}`
    }

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

    return `day ${cls}`
  }
}

class DaySlot extends React.Component {
  render() {
    const {
      day,
      showBooked,
      currency,
      originalCurrency,
      className,
      cellIndex
    } = this.props

    if (!day) {
      return <div className={className} cellindex={cellIndex} />
    }

    const date = dayjs(day.date)

    if (date.add(1, 'day').isBefore(dayjs())) {
      return (
        <div className={className} cellindex={cellIndex}>
          <div>{date.date()}</div>
        </div>
      )
    }

    let content = (
      <Price
        price={{ amount: day.price, currency }}
        target={originalCurrency ? currency : null}
      />
    )

    if (day.booked && showBooked) {
      content = 'Booked'
    } else if (day.unavailable) {
      content = 'Unavailable'
    } else if (day.customPrice) {
      content = <span style={{ color: 'green' }}>{content}</span>
    }

    return (
      <div
        className={className}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onTouchStart={this.onMouseDown}
        onTouchMove={this.onMouseMove}
        cellindex={cellIndex}
      >
        <div>{date.date()}</div>
        <div>{content}</div>
      </div>
    )
  }

  onMouseDown = e => {
    if (this.props.interactive !== true) {
      return
    }

    this.props.onSelectStart(e)
  }

  onMouseMove = e => {
    if (this.props.interactive !== true) {
      return
    }
    this.props.onSelectMove(e)
  }
}

export default Calendar

require('react-styl')(`
  .calendar
    margin-bottom: 2rem
    &.calendar-sm .days > .day
      height: auto
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
        flex-direction: column
        justify-content: space-between
        min-width: 0
        cursor: pointer

        border-style: solid
        border-color: #c2cbd3
        border-width: 0 0 1px 1px
        position: relative
        &.end-row
          border-right-width: 1px

        &.in-past,&.unavailable
          background-color: var(--pale-grey)
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
        &.nbb::after
          border-bottom-color: transparent
        &.nbt::after
          border-top-color: transparent
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
      .btn
        border-color: #c2cbd3
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
