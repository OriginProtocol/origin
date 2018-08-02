import React, { Component, Fragment } from 'react'
import BigCalendar from 'react-big-calendar'
import { injectIntl } from 'react-intl'
import moment from 'moment'
import uuid from 'uuid/v1'

class Calendar extends Component {

  constructor(props) {
    super(props)

    this.setViewType = this.setViewType.bind(this)
    this.onSelectSlot = this.onSelectSlot.bind(this)
    this.onSelectEvent = this.onSelectEvent.bind(this)
    this.handlePriceChange = this.handlePriceChange.bind(this)
    this.saveEvent = this.saveEvent.bind(this)
    this.cancelEvent = this.cancelEvent.bind(this)
    this.onAvailabilityChange = this.onAvailabilityChange.bind(this)
    this.onDateDropdownChange = this.onDateDropdownChange.bind(this)
    this.onIsRecurringEventChange = this.onIsRecurringEventChange.bind(this)
    this.saveData = this.saveData.bind(this)
    this.goBack = this.goBack.bind(this)
    this.reserveSlots = this.reserveSlots.bind(this)
    this.unselectSlots = this.unselectSlots.bind(this)
    this.getDateAvailabilityAndPrice = this.getDateAvailabilityAndPrice.bind(this)
    this.dateCellWrapper = this.dateCellWrapper.bind(this)
    this.monthHeader = this.monthHeader.bind(this)
    this.buyerPrevMonth = this.buyerPrevMonth.bind(this)
    this.buyerNextMonth = this.buyerNextMonth.bind(this)
    this.slotPropGetter = this.slotPropGetter.bind(this)
    this.eventComponent = this.eventComponent.bind(this)
    this.checkSlotsForExistingEvent = this.checkSlotsForExistingEvent.bind(this)
    this.renderHourlyPrices = this.renderHourlyPrices.bind(this)
    this.getDateDropdownOptions = this.getDateDropdownOptions.bind(this)
    this.renderRecurringEvents = this.renderRecurringEvents.bind(this)

    this.state = {
      events: [],
      selectedEvent: {
        price: 0,
        isAvailable: true,
        isRecurringEvent: false
      },
      buyerSelectedSlotData: null,
      defaultDate: new Date(),
      showSellerActionBtns: false,
      hideRecurringEventCheckbox: false
    }
  }

  componentWillMount() {
    BigCalendar.momentLocalizer(moment);
    
    const events = this.props.slots && this.props.slots.map((slot) =>  {
      return { 
        id: uuid(),
        start: moment(slot.startDate).toDate(),
        end: moment(slot.endDate).subtract(1, 'second').toDate(),
        price: slot.priceWei,
        isAvailable: slot.isAvailable,
        slots: slot.slots,
        isRecurringEvent: (slot.recurs === 'weekly')
      }
    })

    this.setState({
      events: (events || [])
    })
  }

  componentDidMount() {
    this.renderHourlyPrices()
    this.renderRecurringEvents(this.state.defaultDate)
  }

  renderHourlyPrices() {
    // This is a hackky way of showing the price in hourly time slots
    // since React Big Calendar doesn't give us full control over the content of those slots
    // Possible future optimization would be to create a PR to React Big Calendar to support custom slot content.
    if (this.props.viewType &&
        this.props.viewType === 'hourly' &&
        this.props.userType &&
        this.props.userType === 'buyer') {
      const slots = document.querySelectorAll('.rbc-time-slot')

      for (let i = 0, slotsLen = slots.length; i < slotsLen; i++) {
        const slot = slots[i]
        const classes = slot.className
        const isAvailable = classes.indexOf('unavailable') === -1
        const priceIdx = classes.indexOf('priceEth-')

        slot.innerHTML = ''

        if (priceIdx > -1 && isAvailable) {
          const price = classes.substring(priceIdx + 9, classes.length)
          const priceNode = document.createTextNode(`${price} ETH`)
          slot.appendChild(priceNode)
        }
      }
    }
  }

  setViewType() {
    return this.props.viewType === 'daily' ? 'month' : 'week'
  }

  checkSlotsForExistingEvent(slotInfo) {
    return this.state.events.filter((event) => {
      let isEventInSlot = false

      for (let i = 0, existSlotsLen = event.slots.length; i < existSlotsLen; i++) {
        const existSlot = event.slots[i]

        for (let j = 0, newSlotsLen = slotInfo.slots.length; j < newSlotsLen; j++) {
          const newSlot = slotInfo.slots[j]

          if (existSlot.toString() === newSlot.toString()) {
            isEventInSlot = true
          }
        }
      }

      return isEventInSlot
    })
  }

  onSelectSlot(slotInfo, shouldOverrideExistingEvent) {
    if (this.props.userType === 'seller') {
      // remove last slot time for hourly calendars - not sure why React Big Calendar includes
      // the next slot after the last selected time slot - seems like a bug.
      if (this.props.viewType === 'hourly') {
        slotInfo.slots && slotInfo.slots.length && slotInfo.slots.splice(-1)
      }

      // if slot doesn't already contain an event, create an event
      const existingEventInSlot = this.checkSlotsForExistingEvent(slotInfo)

      if (existingEventInSlot.length > 1) {
        return this.setState({ showOverlappingEventsErrorMsg: true })
      } else {
        this.setState({ showOverlappingEventsErrorMsg: false })
      }

      let newEvent
      if (!existingEventInSlot.length || 
          (existingEventInSlot.length === 1 && existingEventInSlot[0].isClonedRecurringEvent)) {

        const endDate = this.props.viewType === 'daily' ?
                        moment(slotInfo.end).add(1, 'day').subtract(1, 'second').toDate() :
                        slotInfo.end
        newEvent = {
          ...slotInfo,
          id: uuid(),
          end: endDate,
          allDay: false
        }

        this.setState({
          events: [
            ...this.state.events,
            newEvent
          ],
        })
      }

      // For handling changes in date dropdowns
      let updatedExistingEvent
      if (shouldOverrideExistingEvent && existingEventInSlot.length === 1) {
        updatedExistingEvent = existingEventInSlot[0] && {
          ...existingEventInSlot[0],
          start: slotInfo.start,
          end: slotInfo.end,
          slots: slotInfo.slots
        }
      }

      if (updatedExistingEvent || newEvent) {
        this.onSelectEvent(updatedExistingEvent || newEvent, true)
      }
    } else {
      // user is a buyer
      const selectionData = []
      let slotToTest = moment(slotInfo.start)
      let hasUnavailableSlot = false

      while (slotToTest.toDate() >= slotInfo.start && slotToTest.toDate() <= slotInfo.end) {
        const slotAvailData = this.getDateAvailabilityAndPrice(slotToTest)

        if(!slotAvailData.isAvailable || moment(slotInfo.end).isBefore(moment())){
          hasUnavailableSlot = true
        }

        selectionData.push({
          ...slotInfo,
          price: slotAvailData.price,
          isAvailable: slotAvailData.isAvailable
        })

        if (this.props.viewType === 'daily') {
          slotToTest = slotToTest.add(1, 'days')
        } else {
          slotToTest = slotToTest.add(this.props.step || 60, 'minutes').add(1, 'second')
        }
      }

      if (hasUnavailableSlot) {
        this.setState({
          selectionUnavailable: true,
          selectedEvent: {}
        })
      } else {
        this.setState({
          selectionUnavailable: false,
          selectedEvent: {
            start: slotInfo.start,
            end: slotInfo.end,
            price: selectionData.reduce((totalPrice, nextPrice) => totalPrice + nextPrice.price, 0)
          },
          buyerSelectedSlotData: selectionData
        })
      }
    }
  }

  onSelectEvent(selectedEvent, shouldSaveEvent) {
    const event = {
      ...selectedEvent,
      price: selectedEvent.price || '',
      isAvailable: (selectedEvent.isAvailable !== undefined ? selectedEvent.isAvailable : true),
      isRecurringEvent: selectedEvent.isRecurringEvent || false
    }

    const stateToSet = {
      selectedEvent: event,
      showOverlappingEventsErrorMsg: false
    }

    const existingEventInSlot = this.checkSlotsForExistingEvent(selectedEvent)
    if (existingEventInSlot.length && existingEventInSlot.length > 1) {
      if (!selectedEvent.isRecurringEvent) {
        stateToSet.hideRecurringEventCheckbox = true
      } else {
        stateToSet.hideRecurringEventCheckbox = false
      }
    } else {
      stateToSet.hideRecurringEventCheckbox = false
    }

    this.setState(stateToSet)

    if (shouldSaveEvent) {
      this.saveEvent(event)
    }
  }

  handlePriceChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        price: (event.target.value && parseFloat(event.target.value))
      },
      showSellerActionBtns: true
    })
  }

  saveEvent(selectedEvent) {
    const thisEvent = (selectedEvent && selectedEvent.id ? selectedEvent : false) || this.state.selectedEvent
    const allOtherEvents = this.state.events.filter((event) => event.id !== thisEvent.id)

    this.setState({
      events: [...allOtherEvents, thisEvent],
      showSellerActionBtns: false
    })

    // wait for state to update, then render recurring events on monthly calendar if recurring events checkbox is checked
    setTimeout(() => {
      this.renderRecurringEvents(this.state.defaultDate)
    })
  }

  cancelEvent() {
    const confirmation = confirm('Are you sure you want to delete this event?')
    const { selectedEvent, events } = this.state

    if (confirmation) {
      let allOtherEvents

      if (selectedEvent.isRecurringEvent) {
        allOtherEvents = events.filter((event) => 
          event.id !== selectedEvent.id &&
          event.originalEventId !== selectedEvent.id &&
          event.id !== selectedEvent.originalEventId
        )
      } else {
        allOtherEvents = events.filter((event) => event.id !== selectedEvent.id)
      }

      this.setState({
        events: [...allOtherEvents],
        selectedEvent: {
          price: 0,
          isAvailable: true,
          isRecurringEvent: false
        },
        showSellerActionBtns: false
      })

      setTimeout(() => {
        this.renderRecurringEvents(this.state.defaultDate)
      })
    }
  }

  onAvailabilityChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        isAvailable: !!parseInt(!isNaN(event.target.value) && event.target.value)
      },
      showSellerActionBtns: true
    })
  }

  onDateDropdownChange(event) {
    const whichDropdown = event.target.name
    const value = event.target.value

    const getSlots = () => {
      const startDate = whichDropdown === 'start' ? new Date(value) : new Date(this.state.selectedEvent.start)
      const endDate = whichDropdown === 'end' ? new Date(value) : new Date(this.state.selectedEvent.end)
      const slots = []
      let slotDate = moment(value)

      while (slotDate.toDate() >= startDate && slotDate.toDate() <= endDate) {
        const timePeriod = this.props.viewType === 'daily' ? 'day' : 'hour'
        const slotDateObj = timePeriod ? slotDate.startOf(timePeriod).toDate() : slotDate.toDate()

        if (whichDropdown === 'start') {
          slots.push(slotDateObj)
          slotDate = slotDate.add(1, timePeriod)
        } else {
          slots.unshift(slotDateObj)
          slotDate = slotDate.subtract(1, timePeriod)
        }
      }

      return slots
    }

    this.onSelectSlot({
      ...this.state.selectedEvent,
      slots: getSlots(),
      [whichDropdown]: new Date(value)
    },
    true)
  }

  getDateDropdownOptions(date) {
    const timeToAdd = this.props.viewType === 'daily' ? 'days' : 'hours'

    return [
      ...[...Array(10)].map((_, i) => moment(date).subtract(i + 1, timeToAdd).toDate()).reverse(),
      moment(date).toDate(),
      ...[...Array(10)].map((_, i) => moment(date).add(i + 1, timeToAdd).toDate())
    ]
  }

  onIsRecurringEventChange(event) {
    const { selectedEvent, events } = this.state
    const stateToSet = {
      selectedEvent: {
        ...selectedEvent,
        isRecurringEvent: event.target.checked
      },
      showSellerActionBtns: true
    }

    if (selectedEvent.isClonedRecurringEvent) {
      stateToSet.events = events.map((eventObj) => {
        if (eventObj.id === selectedEvent.originalEventId) {
          eventObj.isRecurringEvent = event.target.checked
        }
        return eventObj
      })
    }

    this.setState(stateToSet)
  }

  eventComponent(data) {
    const { event } = data
    const { isAvailable, price, isRecurringEvent } = event
    const stepAbbrev = this.props.step === 60 ? 'hr' : `${this.props.step} min.`
    const perTimePeriod = this.props.viewType === 'hourly' ? ` /${stepAbbrev}` : ''
    const availClass = isAvailable !== false ? 'available' : 'unavailable'
    const recurringClass = isRecurringEvent ? 'recurring' : 'non-recurring'

    return (
      <div className={ `calendar-event ${availClass} ${recurringClass}` }>
        {isAvailable !== false &&
          <span>{ price ? `${price} ETH${perTimePeriod}` : '0 ETH' }</span>
        }
        {isAvailable === false &&
          <span>Unavailable</span>
        }
      </div>
    )
  }

  isDateBooked(date) {
    let bookingsMatchingDate = []
    this.props.purchases && this.props.purchases.map((purchase) => {
      const bookingsForThisPurchase = purchase.ipfsData.filter(slot => 
        moment(date).isBetween(moment(slot.startDate).subtract(1, 'second'), moment(slot.endDate).add(1, 'second'))
      )
      bookingsMatchingDate = [...bookingsMatchingDate, ...bookingsForThisPurchase]
    })

    return !!bookingsMatchingDate.length
  }

  getDateAvailabilityAndPrice(date) {
    const { events } = this.state
    const eventsInSlot = []
    let toReturn = {
      isAvailable: false,
      price: 0
    }

    if (events && events.length) {
      for (let i = 0, len = events.length; i < len; i++) {
        const event = events[i]
        if (  
              event.isAvailable &&
              moment(date).isBetween(moment(event.start).subtract(1, 'second'), moment(event.end).add(1, 'second')) &&
              !moment(date).isBefore(moment())
            ) {

          event.isAvailable = !this.isDateBooked(date)
          eventsInSlot.push(event)
        }
      }
    }

    if (eventsInSlot.length) {
      const nonRecurringEvents = eventsInSlot.filter((event) => !event.isRecurringEvent)

      if (nonRecurringEvents.length) {
        toReturn = nonRecurringEvents[0]
      } else {
        toReturn = eventsInSlot[0]
      }
    }

    return toReturn
  }

  dateCellWrapper(data) {
    const { value } = data
    const dateInfo = this.getDateAvailabilityAndPrice(value)
    const availability = dateInfo.isAvailable ? 'available' : 'unavailable'
    const isPastDate = moment(value).isBefore(moment().subtract(1, 'day')) ? ' past-date' : ''
    const selectedSlotsMatchingDate = 
      this.state.buyerSelectedSlotData &&
      this.state.buyerSelectedSlotData.filter((slot) => 
        moment(value).isBetween(moment(slot.start).subtract(1, 'second'), moment(slot.end).add(1, 'second'))
      )
    const isSelected = (selectedSlotsMatchingDate && selectedSlotsMatchingDate.length) ? ' selected' : ''

    return (
      <Fragment>
        {this.props.userType === 'buyer' ?
          <div className={`rbc-day-bg ${availability}${isPastDate}${isSelected}`}>
            {dateInfo.isAvailable &&
              <span>{dateInfo.price ? `${dateInfo.price} ETH` : `0 ETH`}</span>
            }
          </div>
          :
          <div className="rbc-day-bg"></div>
        }
      </Fragment>
    )
  }

  monthHeader(data) {
    return <div className="rbc-header">{`${this.props.userType === 'buyer' ? data.label[0] : data.label}`}</div>
  }

  slotPropGetter(date) {
    const slotData = this.getDateAvailabilityAndPrice(date)
    const isAvailable = slotData.isAvailable ? 'available' : 'unavailable'
    const selectedSlotsMatchingDate = 
      this.state.buyerSelectedSlotData &&
      this.state.buyerSelectedSlotData.filter((slot) => 
        moment(date).isBetween(moment(slot.start).subtract(1, 'second'), moment(slot.end))
      )
    const isSelected = (selectedSlotsMatchingDate && selectedSlotsMatchingDate.length) ? ' selected' : ''
    const price = slotData.price ? ` priceEth-${slotData.price}` : ''
    return { className: `${isAvailable}${isSelected}${price}` }
  }

  saveData() {
    const cleanEvents = this.state.events.length &&
                        this.state.events
                        .filter((event) => 
                          !event.isClonedRecurringEvent
                        )
                        .map((event) => {

                          const toReturn = {
                            startDate: event.start.toISOString(),
                            endDate: event.end.toISOString(),
                            isAvailable: event.isAvailable,
                            priceWei: event.price
                          }

                          if (event.isRecurringEvent) {
                            toReturn.recurs = 'weekly'
                          }
                          return toReturn
                        })
    this.props.onComplete && this.props.onComplete(cleanEvents)
  }

  goBack() {
    this.props.onGoBack && this.props.onGoBack()
  }

  reserveSlots() {
    const slotsToReserve = this.state.buyerSelectedSlotData &&
                            this.state.buyerSelectedSlotData.map((slot) => {
                              const toReturn = {
                                startDate: slot.start,
                                endDate: slot.end,
                                priceWei: slot.price,
                              }

                              if (slot.isRecurringEvent) {
                                toReturn.recurs = 'weekly'
                              }

                              return toReturn
                            })
    this.props.onComplete && this.props.onComplete(slotsToReserve)
  }

  unselectSlots() {
    this.setState({
      selectedEvent: {},
      buyerSelectedSlotData: null
    })
  }

  buyerPrevMonth() {
    const date = moment(this.state.defaultDate).subtract(1, this.setViewType()).toDate()

    this.renderRecurringEvents(date)

    this.setState({
      defaultDate: date
    })
  }

  buyerNextMonth() {
    const date = moment(this.state.defaultDate).add(1, this.setViewType()).toDate()

    this.renderRecurringEvents(date)

    this.setState({
      defaultDate: date
    })
  }

  renderRecurringEvents(date) {
    const dateMoment = moment(date)
    const isDaily = this.props.viewType === 'daily'
    const firstVisibleDate = isDaily ?
                              moment(dateMoment.startOf('month')).subtract(1, 'week') :
                              moment(dateMoment.startOf('week'))
    const lastVisibleDate = isDaily ?
                              moment(dateMoment.endOf('month')).add(1, 'week') :
                              moment(dateMoment.endOf('week'))
    const events = []

    const getSlots = (startDate, endDate) => {
      const slots = []
      let slotDate = moment(startDate)

      while (slotDate.toDate() >= startDate && slotDate.toDate() <= endDate) {
        const timePeriod = this.props.viewType === 'daily' ? 'day' : 'hour'
        const slotDateObj = timePeriod ? slotDate.startOf(timePeriod).toDate() : slotDate.toDate()

        slots.push(slotDateObj)
        slotDate = slotDate.add(1, timePeriod)
      }

      // remove the last slot to prevent blocking the slot after the event
      if (!isDaily) {
        slots.pop()
      }

      return slots
    }

    // render recurring events on the currently visible day they recur on
    this.state.events && this.state.events.map((event) => {
      if (event.isRecurringEvent) {
        if (!event.isClonedRecurringEvent) {
          const slotToTest = moment(firstVisibleDate)

          // put the original event in the output "events" array
          const originalEventStartDate = event.start
          events.push(event)

          while (slotToTest.isBefore(lastVisibleDate)) {
            const slotDayOfWeekIdx = slotToTest.day()
            const eventDayOfWeekIdx = moment(event.start).day()

            if (slotDayOfWeekIdx === eventDayOfWeekIdx) {
              const clonedEvent = JSON.parse(JSON.stringify(event))
              const diffBtwStartAndEnd = moment(clonedEvent.end).diff(moment(clonedEvent.start), 'days')
              const clonedEndMoment = moment(clonedEvent.end)
              const setterConfig = {
                date: slotToTest.date(),
                month: slotToTest.month(),
                year: slotToTest.year()
              }
              clonedEvent.originalEventId = event.id
              clonedEvent.id = uuid()
              clonedEvent.isClonedRecurringEvent = true
              clonedEvent.start = moment(clonedEvent.start).set(setterConfig).toDate()
              clonedEvent.end = moment(clonedEvent.start)
                                  .add(diffBtwStartAndEnd, 'days')
                                  .set({
                                    hour: clonedEndMoment.hour(),
                                    minute: clonedEndMoment.minute(),
                                    second: clonedEndMoment.second()
                                  })
                                  .toDate()
              clonedEvent.slots = getSlots(clonedEvent.start, clonedEvent.end)

              // put the cloned "recurring" instances of the event in the output "events" array
              if (clonedEvent.start.toString() !== originalEventStartDate.toString())
                events.push(clonedEvent)
            }

            slotToTest.add(1, 'day')
          }
        }
      } else if (!event.isClonedRecurringEvent) {
        // put the non-recurring events in the output "events" array
        events.push(event)
      }
    })

    this.setState({
      defaultDate: date,
      events
    })

    setTimeout(() => {
      this.renderHourlyPrices()
    })
  }

  render() {
    const selectedEvent = this.state.selectedEvent
    const { viewType, userType } = this.props

    return (
      <div>
        <div className="row">
          <div className={`col-md-8 
                           calendar-container
                           ${userType === 'buyer' ? ' buyer-view' : ''}
                           ${viewType === 'daily' ? ' daily-view' : ' hourly-view'}`}>
            {
              userType === 'buyer' &&
              <div className="buyer-month-nav">
                <img onClick={this.buyerPrevMonth} className="prev-month" src="/images/carat-dark.svg" />
                <img onClick={this.buyerNextMonth} className="next-month" src="/images/carat-dark.svg" />
              </div>
            }
            <BigCalendar
              components={{
                event: this.eventComponent,
                dateCellWrapper: this.dateCellWrapper,
                month: {
                  header: this.monthHeader
                }
              }}
              selectable={ true }
              events={ (userType === 'seller' && this.state.events) || [] }
              defaultView={ BigCalendar.Views[this.setViewType().toUpperCase()] }
              onSelectEvent={ this.onSelectEvent }
              onSelectSlot={ this.onSelectSlot }
              step={ this.props.step || 60 }
              timeslots={ 1 }
              date={ this.state.defaultDate }
              onNavigate={ this.renderRecurringEvents }
              slotPropGetter={ this.slotPropGetter }
              scrollToTime={ moment(this.state.defaultDate).hour(8).toDate() }
            />
            {
              userType === 'seller' &&
              <div className="btn-container">
                <button className="btn btn-other" onClick={this.goBack}>Back</button>
                <button className="btn btn-primary" onClick={this.saveData}>Next</button>
              </div>
            }
          </div>
          <div className="col-md-4">
            {this.state.showOverlappingEventsErrorMsg &&
              <p className="calendar-error-msg">Only one recurring price and one non-recurring price can be set for each time slot.</p>
            }
            {selectedEvent && selectedEvent.start && !this.state.showOverlappingEventsErrorMsg &&
              <div className="calendar-cta">
                <p className="font-weight-bold">Selected { viewType === 'daily' ? 'dates' : 'times' }</p>
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <select
                        name="start"
                        className="form-control"
                        onChange={ this.onDateDropdownChange }
                        value={ selectedEvent.start.toString() }>
                        { 
                          this.getDateDropdownOptions(selectedEvent.start).map((date) => (
                            ((viewType === 'daily' && date <= selectedEvent.end) ||
                            (viewType === 'hourly' && date < selectedEvent.end)) &&
                            <option
                              key={date.toString()}
                              value={date.toString()}>
                              {moment(date).format(viewType === 'daily' ? 'MM/DD/YY' : 'LT')}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="col-md-6">
                      <select
                        name="end"
                        className="form-control"
                        onChange={ this.onDateDropdownChange }
                        value={selectedEvent.end.toString()}>
                        { 
                          this.getDateDropdownOptions(selectedEvent.end).map((date) => (
                            ((viewType === 'daily' && date >= selectedEvent.start) ||
                            (viewType === 'hourly' && date > selectedEvent.start)) &&
                            <option
                              key={date.toString()}
                              value={date.toString()}>
                              {moment(date).format(viewType === 'daily' ? 'MM/DD/YY' : 'LT')}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </div>
                {userType === 'seller' &&
                  <Fragment>
                    {!this.state.hideRecurringEventCheckbox &&
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isRecurringEvent"
                          checked={ selectedEvent.isRecurringEvent }
                          onChange={ this.onIsRecurringEventChange } />
                        <label className="form-check-label" htmlFor="isRecurringEvent">
                          This is a repeating event
                        </label>
                      </div>
                    }
                    <div>
                      <p className="font-weight-bold">Availability</p>
                      <div>
                        <label htmlFor="available">
                          Availaible
                        </label>
                        <input 
                          type="radio"
                          name="isAvailable"
                          id="available"
                          value="1"
                          onChange={ this.onAvailabilityChange }
                          checked={ selectedEvent.isAvailable } />
                      </div>
                      <div>
                        <label className="form-check-label" htmlFor="unavailable">
                          Unavailable
                        </label>
                        <input
                          type="radio"
                          name="isAvailable"
                          id="unavailable"
                          value="0"
                          onChange={ this.onAvailabilityChange }
                          checked={ !selectedEvent.isAvailable } />
                      </div>
                      {selectedEvent.isAvailable &&
                        <Fragment>
                          <p className="font-weight-bold">Pricing</p>
                          <input 
                            placeholder="Price"
                            name="price"
                            type="number"
                            step="0.00001"
                            value={selectedEvent.price} 
                            onChange={this.handlePriceChange} 
                          />
                          {
                            viewType === 'hourly' &&
                            this.props.step &&
                            <span className="price-label">
                              &nbsp;ETH per hour
                            </span>
                          }
                          {viewType === 'daily' &&
                            <span className="price-label">&nbsp;ETH</span>
                          }
                        </Fragment>
                      }
                    </div>
                    {this.state.showSellerActionBtns &&
                      <div className="cta-btns row">
                        <div className="col-md-6">
                          <button className="btn btn-dark" onClick={this.cancelEvent}>Cancel</button>
                        </div>
                        <div className="col-md-6">
                          <button className="btn btn-light" onClick={this.saveEvent}>Save</button>
                        </div>
                      </div>
                    }
                  </Fragment>
                }
                {userType === 'buyer' &&
                  <div>
                    <p className="font-weight-bold">Price</p>
                    <p>{selectedEvent.price} ETH</p>
                    <div className="cta-btns row">
                      <div className="col-md-6">
                        <button className="btn btn-dark" onClick={this.unselectSlots}>Cancel</button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-light" onClick={this.reserveSlots}>Reserve</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
            {this.state.selectionUnavailable &&
              <p className="selection-unavailable font-weight-bold">
                Your selection contains one or more unavailable time slots.
              </p>
            }
          </div>
        </div>
      </div>
    )
  }

}

export default injectIntl(Calendar)
