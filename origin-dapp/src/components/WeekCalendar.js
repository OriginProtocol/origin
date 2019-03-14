import React, { Component } from 'react'
import dayjs from 'dayjs'

const resetDrag = {
  dragEnd: null,
  dragStart: null,
  dragging: false
}

class WeekCalendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      weekStartDate: dayjs().startOf('week') // Default to current week
    }
    this.scrollComponentRef = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.range && !this.props.range) {
      this.setState({ ...resetDrag })
    }
  }

  componentDidMount() {
    const slotHeight = 50 // TODO: Read height px dynamically from DOM
    this.scrollComponentRef.current.scrollTop = dayjs().hour() * slotHeight
  }

  render() {
    const { weekStartDate } = this.state,
      // startOfMonth = new Date(year, month),
      // date = dayjs(startOfMonth),
      isBeginning = weekStartDate.isBefore(dayjs()), // Is it before now?
      lastDay = weekStartDate.add(1, 'week'),
      hours = this.props.availability.getAvailability(
        weekStartDate.format('YYYY-MM-DDTHH:00:00'),
        weekStartDate.add(27 * 7, 'hour').format('YYYY-MM-DDTHH:00:00')
      )

    return (
      <div className={`weekCalendar${this.props.small ? ' calendar-sm' : ''}`}>
        <div className="week-chooser">
          <button
            type="button"
            className={`btn btn-outline-secondary prev${
              isBeginning ? ' disabled' : ''
            }`}
            onClick={() => {
              if (isBeginning) {
                return
              }
              this.setState({
                weekStartDate: weekStartDate.add(-1, 'week'),
                ...resetDrag
              })
            }}
          />
          {weekStartDate.format('MMM ')}
          {lastDay.month() != weekStartDate.month()
            ? lastDay.format('- MMM ')
            : ''}
          {weekStartDate.format('YYYY')}
          <button
            type="button"
            className="btn btn-outline-secondary next"
            onClick={() => {
              this.setState({
                weekStartDate: weekStartDate.add(+1, 'week'),
                ...resetDrag
              })
            }}
          />
        </div>

        <div className="day-header">
          <div>{/* Time column */}</div>
          {[...Array(7)].map((_, k) => (
            <div key={k}>
              <div className="day-column-name">
                {weekStartDate.add(k, 'day').format('ddd')}
              </div>
              <div className="day-column-number">
                {weekStartDate.add(k, 'day').format('D')}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`slots${this.state.dragging ? '' : ' inactive'}`}
          ref={this.scrollComponentRef}
        >
          {/* Time label column */}
          {[...Array(24)].map((_, k) => (
            <div key={k} className="time-column-label">
              <div>{weekStartDate.add(k, 'hour').format('ha')}</div>
            </div>
          ))}
          {/* All selectable hours */}
          {Array(7 * 24)
            .fill(0)
            .map((v, idx) => this.renderHour(hours, idx))}
        </div>
      </div>
    )
  }

  renderHour(hours, idx) {
    const hour = hours[idx]
    if (!hour) {
      return (
        <div
          key={idx}
          className={`empty ${idx < 7 ? 'first-row' : 'last-row'}`}
        />
      )
    }

    // Hour in past
    if (dayjs(hour.hour).isBefore(dayjs())) {
      return (
        <div
          key={idx}
          className={`hour in-past${idx % 7 === 6 ? ' end-row' : ''}`}
        />
      )
    }

    let content = `${hour.price} ETH`
    if (hour.booked && this.props.showBooked) {
      content = 'Booked'
    } else if (hour.unavailable) {
      content = 'Unavailable'
    } else if (hour.customPrice) {
      content = <span style={{ color: 'green' }}>{content}</span>
    }

    let interactions = {}
    if (this.props.interactive !== false) {
      interactions = {
        onMouseDown: () => {
          this.setState({
            dragging: true,
            dragStart: idx,
            startDate: hour.hour,
            dragEnd: null,
            endDate: null
          })
        },
        onMouseUp: () => {
          const endDate = hour.hour
          this.setState({ dragEnd: idx, dragging: false, endDate: endDate })
          if (this.props.onChange) {
            let rangeStartDate = dayjs(this.state.startDate),
              rangeEndDate = dayjs(endDate)

            // Handle if enddate is actually *before* startdate
            if (rangeEndDate.isBefore(rangeStartDate)) {
              const temp = rangeStartDate
              rangeStartDate = rangeEndDate
              rangeEndDate = temp
            }
            // We add an hour to end. If user drags to select the 4pm slot, that means thier booking
            // *acutally* ends at 5pm.
            rangeEndDate = rangeEndDate.add(1, 'hour')
            // ISO 8601 Interval format
            // e.g. "2019-03-01T01:00:00/2019-03-01T03:00:00"
            const range =
              rangeStartDate.format('YYYY-MM-DDTHH:mm:ss') +
              '/' +
              rangeEndDate.format('YYYY-MM-DDTHH:mm:ss')

            this.props.onChange({ range })
          }
        },
        onMouseOver: () => this.setState({ dragOver: idx })
      }
    }

    return (
      <div
        key={idx}
        className={`hour ${this.getClass(idx, hour)}`}
        {...interactions}
      >
        <div>{content}</div>
      </div>
    )
  }

  // Get class for this hour, determining if e.g. it is selected
  getClass(idx, hour) {
    const initStart = this.state.dragStart,
      initEnd = this.state.dragging ? this.state.dragOver : this.state.dragEnd,
      start = initStart < initEnd ? initStart : initEnd,
      end = initStart < initEnd ? initEnd : initStart

    let cls = this.props.interactive === false ? '' : 'active',
      unselected = false

    if (idx === start && idx === end) {
      cls += ' single' // Single cell selected
    } else if (idx === start) {
      cls += ' start' // Start of selection
    } else if (idx === end) {
      cls += ' end' // End of selection
    } else if (idx > start && idx < end) {
      cls += ' mid' // Mid part of selection
    } else {
      cls += ' unselected'
      unselected = true
    }

    // TODO: (STAN) this seems to be based on days of week?? Ask Nick

    if (!unselected && idx + 7 >= start && idx + 7 <= end) {
      cls += ' nbb'
    }
    if (!unselected && idx - 7 >= start && idx - 7 <= end) {
      cls += ' nbt'
    }
    if (hour.unavailable || hour.booked) {
      cls += ' unavailable'
    }

    return cls
  }
}

export default WeekCalendar

require('react-styl')(`
  .weekCalendar
    margin-bottom: 2rem
    &.calendar-sm .days > .day
      height: auto
    .slots
      height: 500px
      overflow-y: scroll
      overflow-x: hidden
      display: grid
      grid-template-columns: repeat(8, 1fr)
      grid-template-rows: repeat(24, 1fr)
      grid-auto-flow: column
      user-select: none
      border-style: solid
      border-color: #c2cbd3
      border-width: 1px 1px 1px 1px
      > .empty.first-row
        border-bottom: 1px solid #c2cbd3
      > .time-column-label
        border-style: solid
        border-color: #c2cbd3
        border-width: 0 1px 0 0
        text-align: right
        padding-right: 0.5rem
        > div
          margin-top: -1rem
      > .hour
        height: 50px
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

        &.in-past,&.unavailable
          background-color: var(--pale-grey)
        &.unavailable
          div:nth-child(1)
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
          border-width: 3px 3px 0 3px
          border-color: black
        &.mid::after
          border-width: 0 3px 0px 3px
          border-color: black
        &.end::after
          border-width: 0 3px 3px 3px
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
      border-width: 0 0 0 0
      border-style: solid
      border-color: #c2cbd3
      justify-content: space-between;
      text-align: left
      padding-left: 1rem
      font-size: 14px
      font-weight: normal
      color: var(--bluey-grey)
      margin-top: 1rem;
      line-height: 2rem;
      > div
        flex: 1
        .day-column-name
          text-transform: uppercase
        .day-column-number
          font-size: 24px
          color: var(--dark)

    .week-chooser
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
