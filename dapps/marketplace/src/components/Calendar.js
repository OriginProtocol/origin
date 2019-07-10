import React, { Component } from 'react'
import dayjs from 'dayjs'

import Price from 'components/Price'

class Calendar extends Component {
  constructor(props) {
    super(props)
    const today = dayjs().startOf('day')

    const availableFrom = today.startOf('month')
    const availableUntil = today.add(1, 'year').endOf('month')

    this.state = {
      today: today,
      availableFrom,
      availableUntil,
      year: today.year(),
      availability: this.getAvailability(availableFrom, availableUntil),

      dragStartDate: props.startDate ? dayjs(props.startDate) : null,
      dragEndDate: props.endDate ? dayjs(props.endDate) : null
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { dragStartDate, dragEndDate } = this.state

    if (
      this.props.onChange &&
      (prevState.dragStartDate !== dragStartDate ||
        prevState.dragEndDate !== dragEndDate)
    ) {
      let range = dragStartDate ? dragStartDate.format('YYYY-MM-DD') : ''
      range += dragEndDate ? '/' + dragEndDate.format('YYYY-MM-DD') : ''
      this.props.onChange({
        range
      })
    }

    if (
      prevProps.startDate !== this.props.startDate ||
      prevProps.endDate !== this.props.endDate
    ) {
      this.setState({
        dragStartDate: this.props.startDate
          ? dayjs(this.props.startDate)
          : null,
        dragEndDate: this.props.endDate ? dayjs(this.props.endDate) : null
      })
    }
  }

  getAvailability(availableFrom, availableUntil) {
    const listingAvailability = this.props.availability.getAvailability(
      availableFrom,
      availableUntil
    )

    // Group availability by month
    const groupedAvailability = listingAvailability.reduce(
      (grouped, availability) => {
        const date = dayjs(availability.date).startOf('day')
        const key = `${date.year()}-${('' + date.month()).padStart(2, '0')}`

        return {
          ...grouped,
          [key]: [
            ...(grouped[key] || []),
            {
              ...availability,
              date
            }
          ]
        }
      },
      []
    )

    return groupedAvailability
  }

  getNextUnavailableDate(fromDate) {
    const { availability } = this.state

    const key = `${fromDate.year()}-${('' + fromDate.month()).padStart(2, '0')}`

    // Get the selected month and the months after that
    const slots = Object.values(availability)
      .slice(Object.keys(availability).indexOf(key))
      .reduce((accumulator, monthAvailability) => {
        // Flatten
        return [...accumulator, ...monthAvailability]
      }, [])

    // Find the first non-bookable date after `fromDate`
    const firstUnavailableSlot = slots.find(slot => {
      if (!slot.date.isAfter(fromDate)) {
        // Ignore dates before `fromDate`
        return false
      }

      return slot.unavailable || slot.booked || !slot.price
    })

    return firstUnavailableSlot
      ? firstUnavailableSlot.date
      : slots[slots.length - 1].date
  }

  getClass(slot) {
    const { today, dragStartDate, dragEndDate, canBookUpto } = this.state

    const className = ['day']
    let unavailable = slot.unavailable || slot.booked || !slot.price
    const inPast = slot.date.isBefore(today)
    const isToday = slot.date.isSame(today)

    const notInSelection = !dragStartDate || (dragStartDate && dragEndDate)

    if (notInSelection && unavailable) {
      className.push('unavailable')
    }

    if (inPast) {
      unavailable = true
      className.push('in-past')
    } else if (isToday) {
      className.push('today')
    }

    if (dragStartDate) {
      const isStartDate = dragStartDate.isSame(slot.date)
      const isBeforeStartDate = slot.date.isBefore(dragStartDate)

      if (isStartDate) {
        className.push(dragEndDate ? 'start' : 'single')
      } else if (dragEndDate && dragEndDate.isSame(slot.date)) {
        className.push('end')
      } else if (
        dragEndDate &&
        slot.date.isBetween(dragStartDate, dragEndDate)
      ) {
        className.push('mid')
      } else if (canBookUpto && slot.date.isAfter(canBookUpto)) {
        // Cannot be included in the range
        className.push('disabled')
      } else if (!dragEndDate && !isBeforeStartDate && !isStartDate) {
        className.push('can-check-out')
      }

      if (unavailable && isBeforeStartDate) {
        className.push('disabled', 'unavailable')
      }
    }

    return className.join(' ')
  }

  renderSlot(slot, index) {
    const { canBookUpto } = this.state

    if (!slot) {
      return <div className="empty" key={index} />
    }

    const slotClassName = this.getClass(slot)
    // Note: Can checkout on unavailable/booked slot
    const canInteract =
      !slotClassName.includes('single') &&
      (canBookUpto
        ? !slotClassName.includes('disabled')
        : !slotClassName.includes('unavailable'))

    let content = (
      <Price
        price={{ amount: slot.price, currency: this.props.currency }}
        target={this.props.originalCurrency ? this.props.currency : null}
      />
    )

    if (slot.booked && this.props.showBooked) {
      content = 'Booked'
    } else if (slot.unavailable || !slot.price) {
      content = null
    } else if (slot.customPrice) {
      content = <span className="custom-price">{content}</span>
    }

    let interactions = {}
    if (canInteract && this.props.interactive !== false) {
      interactions = {
        onClick: () => {
          const { dragStartDate, dragEndDate } = this.state

          if (!dragStartDate) {
            // First selection in the calendar
            return this.setState({
              dragStartDate: slot.date,
              dragEndDate: null,
              canBookUpto: this.getNextUnavailableDate(slot.date)
            })
          } else if (!dragEndDate) {
            // Selection to range
            if (slot.date.isBefore(dragStartDate)) {
              // Range should always be selected in order
              // TODO: Discuss if this is needed
              return this.setState({
                dragStartDate: slot.date,
                dragEndDate: null,
                canBookUpto: this.getNextUnavailableDate(slot.date)
              })
            }

            return this.setState({
              dragEndDate: slot.date,
              canBookUpto: null
            })
          }

          return this.setState({
            dragStartDate: slot.date,
            dragEndDate: null,
            canBookUpto: this.getNextUnavailableDate(slot.date)
          })
        }
      }
    }

    return (
      <div className={slotClassName} key={index} {...interactions}>
        <div>{slot.date.date()}</div>
        <div className="day-meta">{content}</div>
      </div>
    )
  }

  renderMonth(monthAvailability, key) {
    const { year } = this.state
    const firstDate = monthAvailability[0].date
    const monthName = firstDate.format(
      `MMMM${firstDate.year() === year ? '' : ' YYYY'}`
    )
    const firstDay = firstDate.day()
    const lastDay = monthAvailability[monthAvailability.length - 1].date.day()

    const slots = [
      ...Array(firstDay).fill(null),
      ...monthAvailability,
      ...Array(6 - lastDay).fill(null)
    ]

    return (
      <div className="calendar" key={key}>
        <div className="month-chooser">{monthName}</div>
        <div className="days">
          {slots.map((slot, index) => this.renderSlot(slot, index))}
        </div>
      </div>
    )
  }

  renderAvailabilityCalendar() {
    const { availability } = this.state

    if (!availability) {
      // Not available
      return null
    }

    // render each month
    return Object.keys(availability).map(key =>
      this.renderMonth(availability[key], key)
    )
  }

  render() {
    return (
      <div className="availability-calendar">
        {this.renderAvailabilityCalendar()}
      </div>
    )
  }
}

export default Calendar

require('react-styl')(`
  .availability-calendar
    flex: 1
    overflow-y: scroll
    overflow-x: hidden
    .calendar
      margin-bottom: 2rem
      .days
        display: grid
        grid-template-columns: repeat(7, 1fr)
        user-select: none
        margin-left: auto
        margin-right: auto
        grid-row-gap: 5px
        grid-column-gap: 0
        > .day
          height: 2.5rem
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

          &.in-past, &.unavailable
            text-decoration: line-through
            color: var(--light)
          &.unavailable, &.disabled
            color: var(--light)
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
          &.today
            &:not(.start)
              border: 1px solid #007fff
              border-radius: 10px
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
            &.unavailable
              text-decoration: none
          &.single
            border-radius: 10px
            background-color: #007fff
            color: var(--white)
          &.can-check-out
            font-weight: 900

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
