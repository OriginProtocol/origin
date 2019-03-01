import React, { Component, Fragment } from 'react'
import BigCalendar from 'react-big-calendar'
import { FormattedMessage, injectIntl } from 'react-intl'
import moment from 'moment-timezone'
import uuid from 'utils/uuid'
import { 
  generateCalendarSlots,
  renderHourlyPrices,
  getSlotsForDateChange,
  getDateDropdownOptions,
  getRecurringEvents,
  getSlotsToReserve,
  getCleanEvents,
  getDateAvailabilityAndPrice,
  generateSlotStartEnd,
  slotsToJCal,
  isDateSelected,
  highlightCalendarDrag,
  doFancyDateSelectionBorders,
  deSelectAllCells
} from 'utils/calendarHelpers'

class Calendar extends Component {

  constructor(props) {
    super(props)

    this.getViewType = this.getViewType.bind(this)
    this.onSelectSlot = this.onSelectSlot.bind(this)
    this.createSellerEvent = this.createSellerEvent.bind(this)
    this.handleBuyerSelection = this.handleBuyerSelection.bind(this)
    this.selectEvent = this.selectEvent.bind(this)
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
    this.dateCellWrapper = this.dateCellWrapper.bind(this)
    this.monthHeader = this.monthHeader.bind(this)
    this.prevPeriod = this.prevPeriod.bind(this)
    this.nextPeriod = this.nextPeriod.bind(this)
    this.goToToday = this.goToToday.bind(this)
    this.slotPropGetter = this.slotPropGetter.bind(this)
    this.renderRecurringEvents = this.renderRecurringEvents.bind(this)

    this.currentDate = new Date()

    this.state = {
      events: [],
      selectedEvent: null,
      buyerSelectedSlotData: null,
      calendarDate: this.currentDate,
      showSellerActionBtns: true,
      editAllEventsInSeries: true,
      existingEventSelected: false,
      clickedSlotInfo: null,
      showPastDateSelectedError: false
    }

    this.localizer = BigCalendar.momentLocalizer(moment)
  }

  componentWillMount() {
    if (this.props.slots) {
      const events = generateCalendarSlots(this.props.slots).map((slot) =>  {
        return {
          id: uuid(),
          start: moment(slot.startDate).toDate(),
          end: moment(slot.endDate).subtract(1, 'second').toDate(),
          timeZone: slot.timeZone,
          price: slot.price && slot.price.amount && parseFloat(slot.price.amount),
          isAvailable: slot.isAvailable,
          slots: slot.slots,
          isRecurringEvent: (slot.rrule === 'FREQ=WEEKLY;')
        }
      })

      this.setState({
        events
      })
    }
  }

  componentDidMount() {
    renderHourlyPrices(this.props.viewType, this.props.userType)
    this.renderRecurringEvents(this.state.calendarDate)
    highlightCalendarDrag()
  }

  componentDidUpdate() {
    renderHourlyPrices(this.props.viewType, this.props.userType)
  }

  getViewType() {
    return this.props.viewType === 'daily' ? 'month' : 'week'
  }

  onSelectSlot(clickedSlotInfo) {
    this.setState({ clickedSlotInfo })

    if (this.props.userType === 'seller') {

      // Check if slot is in the past
      const timePeriod = this.props.viewType === 'hourly' ? 'hour' : 'day'
      if (
          moment(clickedSlotInfo.start).isBefore(moment().startOf(timePeriod)) ||
          moment(clickedSlotInfo.end).isBefore(moment().startOf(timePeriod))
        ) {
        deSelectAllCells()

        return this.setState({
          showPastDateSelectedError: true,
          selectedEvent: null
        })
      }

      // remove last slot time for hourly calendars - not sure why React Big Calendar includes
      // the next slot after the last selected time slot - seems like a bug.
      // Potential oppportunity for PR or issue creation in React Big Calendar
      if (this.props.viewType === 'hourly') {
        clickedSlotInfo.slots && clickedSlotInfo.slots.length && clickedSlotInfo.slots.splice(-1)
      }

      this.createSellerEvent(clickedSlotInfo)
    } else {
      // user is a buyer
      this.handleBuyerSelection(clickedSlotInfo)
    } 
  }

  createSellerEvent(eventInfo) {
    const endDate = this.props.viewType === 'daily' ?
      moment(eventInfo.end).add(1, 'day').subtract(1, 'second').toDate() :
      moment(eventInfo.end).subtract(1, 'second').toDate()

    const newEvent = {
      ...eventInfo,
      end: endDate,
      allDay: false
    }

    const availData = eventInfo.slots && eventInfo.slots.map((date) => {
      return getDateAvailabilityAndPrice(date, this.state.events, [], true)
    }) || []

    let isAvailable = null
    let price = null
    let selectionHasAvailabilityDifference = false
    let selectionHasPriceDifference = false

    availData.map((data) => {
      if (isAvailable === null) {
        isAvailable = data.isAvailable
      } else if (data.isAvailable !== isAvailable) {
        selectionHasAvailabilityDifference = true
      }

      if (price === null) {
        price = data.price
      } else if (price !== null && data.price !== price) {
        selectionHasPriceDifference = true
      }
    })

    if (!selectionHasAvailabilityDifference) {
      newEvent.isAvailable = isAvailable
    }

    if (!selectionHasPriceDifference) {
      newEvent.price = price
    }

    this.selectEvent(newEvent)
  }

  async handleBuyerSelection(slotInfo) {
    const selectionData = []
    let slotToTest = moment(slotInfo.start)
    let hasUnavailableSlot = false
    let slotIndex = 0

    while (slotToTest.toDate() >= slotInfo.start && slotToTest.toDate() <= slotInfo.end) {
      const slotAvailData = getDateAvailabilityAndPrice(slotToTest, this.state.events, this.props.offers)
      const { price, isAvailable, isRecurringEvent, timeZone } = slotAvailData
      const timePeriod = this.props.viewType === 'hourly' ? 'hour' : 'day'

      if (!isAvailable || moment(slotInfo.end).isBefore(moment().startOf(timePeriod))){
        hasUnavailableSlot = true
      }

      const slot = generateSlotStartEnd(slotInfo.start, this.props.viewType, slotIndex)

      selectionData.push({
        ...slot,
        price,
        isAvailable,
        isRecurringEvent,
        timeZone
      })

      slotIndex++

      if (this.props.viewType === 'daily') {
        slotToTest = slotToTest.add(1, 'days')
      } else {
        slotToTest = slotToTest.add(this.props.step || 60, 'minutes').add(1, 'second')
      }
    }

    if (hasUnavailableSlot) {
      await this.setState({
        selectionUnavailable: true,
        selectedEvent: {}
      })

      deSelectAllCells()
    } else {
      const price = selectionData.reduce(
        (totalPrice, nextPrice) => totalPrice + nextPrice.price, 0
      )
      const priceFormatted = `${Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5
      })}`

      await this.setState({
        selectionUnavailable: false,
        selectedEvent: {
          start: slotInfo.start,
          end: slotInfo.end,
          timeZone: slotInfo.timeZone,
          price: priceFormatted
        },
        buyerSelectedSlotData: selectionData
      })
    }

    doFancyDateSelectionBorders()
  }

  async selectEvent(selectedEvent) {
    const event = {
      ...selectedEvent,
      price: selectedEvent.price || '',
      isAvailable: (selectedEvent.isAvailable !== undefined ? selectedEvent.isAvailable : true),
      isRecurringEvent: selectedEvent.isRecurringEvent || false
    }

    const stateToSet = {
      selectedEvent: event,
      showPastDateSelectedError: false,
      editAllEventsInSeries: true,
      isAvailable: true
    }

    await this.setState(stateToSet)
    doFancyDateSelectionBorders()
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
    const thisEvent = (selectedEvent && selectedEvent.id) ? selectedEvent : this.state.selectedEvent

    const newEvents = []
    let slotToTest = moment(thisEvent.start)
    let slotIndex = 0

    while (slotToTest.toDate() >= thisEvent.start && slotToTest.toDate() <= thisEvent.end) {
      const slot = generateSlotStartEnd(thisEvent.start, this.props.viewType, slotIndex)

      newEvents.push({
        ...slot,
        id: uuid(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: false,
        isAvailable: thisEvent.isAvailable,
        price: thisEvent.price,
        isRecurringEvent: false
      })

      slotIndex++

      if (this.props.viewType === 'daily') {
        slotToTest = slotToTest.add(1, 'days')
      } else {
        slotToTest = slotToTest.add(this.props.step || 60, 'minutes').add(1, 'second')
      }
    }

    const filteredEvents = this.state.events.filter(existingEvent => {
      const matchingEvent = newEvents.find(newEvent => {
        return newEvent.start.toString() === existingEvent.start.toString() &&
          newEvent.end.toString() === existingEvent.end.toString()
      })

      return !matchingEvent
    })

    this.setState({
      events: [
        ...filteredEvents,
        ...newEvents
      ],
      showSellerActionBtns: false
    })
  }

  cancelEvent() {
    const unChangedEvent = this.state.events.filter((event) => event.id === this.state.selectedEvent.id)
    this.setState({
      selectedEvent: unChangedEvent[0],
      editAllEventsInSeries: true,
      isAvailable: true
    })
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

  async onDateDropdownChange(event) {
    const whichDropdown = event.target.name
    const value = event.target.value
    const selectedEvent = {
      ...this.state.selectedEvent,
      slots: getSlotsForDateChange(this.state.selectedEvent, whichDropdown, value, this.props.viewType),
      [whichDropdown]: new Date(value)
    }

    await this.setState({ selectedEvent })

    if (this.props.userType === 'buyer') {
        this.onSelectSlot(this.state.selectedEvent)
    }

    doFancyDateSelectionBorders()
  }

  onIsRecurringEventChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        isRecurringEvent: event.target.checked
      },
      showSellerActionBtns: true
    })
  }

  dateCellWrapper(data) {
    const { selectedEvent, buyerSelectedSlotData, events } = this.state
    const { value } = data
    const slotData = getDateAvailabilityAndPrice(value, events, this.props.offers)
    const availability = slotData.isAvailable ? 'available' : 'unavailable'
    const isSelected = isDateSelected(selectedEvent || buyerSelectedSlotData, value) ? ' selected' : ''
    const isPastDate = moment(value).isBefore(moment().startOf('day')) ? ' past-date' : ' future-date'

    return (
      <div className={`rbc-day-bg ${availability}${isSelected}${isPastDate}`}>
        {slotData.isAvailable &&
          <span className="slot-price">{slotData.price ? `${slotData.price} ETH` : `0 ETH`}</span>
        }
      </div>
    )
  }

  monthHeader(data) {
    return <div className="rbc-header">{`${this.props.userType === 'buyer' ? data.label[0] : data.label}`}</div>
  }

  slotPropGetter(date) {
    const { selectedEvent, buyerSelectedSlotData } = this.state
    const slotData = getDateAvailabilityAndPrice(date, this.state.events)
    const isAvailable = slotData.isAvailable ? 'available' : 'unavailable'
    const isSelected = isDateSelected(selectedEvent || buyerSelectedSlotData, date) ? ' selected' : ''
    const price = slotData.price ? ` priceEth-${slotData.price}` : ' priceEth-0'
    const timePeriod = this.props.viewType === 'hourly' ? 'hour' : 'day'
    const isPastDate = moment(date).isBefore(moment().startOf(timePeriod)) ? ' past-date' : ' future-date'
    return { className: `${isAvailable}${isSelected}${isPastDate}${price}` }
  }

  saveData() {
    const events = this.state.events

    if (!events || !events.length) {
      return this.setState({ showNoEventsEnteredErrorMessage: true })
    } else {
      this.setState({ showNoEventsEnteredErrorMessage: false })
    }

    const cleanEvents = getCleanEvents(this.state.events)
    const jCalEvents = slotsToJCal(cleanEvents, 'listing')

    this.props.onComplete && this.props.onComplete(jCalEvents)
  }

  goBack() {
    const cleanEvents = getCleanEvents(this.state.events)
    this.props.onGoBack && this.props.onGoBack(cleanEvents)
  }

  reserveSlots() {
    const slotsToReserve = getSlotsToReserve(this.state.buyerSelectedSlotData)
    this.props.onComplete && this.props.onComplete(slotsToReserve)
  }

  unselectSlots() {
    this.setState({
      selectedEvent: {},
      buyerSelectedSlotData: null
    })
  }

  async prevPeriod() {
    const date = moment(this.state.calendarDate).subtract(1, this.getViewType()).toDate()

    this.renderRecurringEvents(date)

    await this.setState({
      calendarDate: date
    })

    highlightCalendarDrag()
  }

  async nextPeriod() {
    const date = moment(this.state.calendarDate).add(1, this.getViewType()).toDate()

    this.renderRecurringEvents(date)
    highlightCalendarDrag()

    await this.setState({
      calendarDate: date
    })

    highlightCalendarDrag()
  }

  async goToToday() {
    const date = new Date()
    this.renderRecurringEvents(date)
    highlightCalendarDrag()
    this.currentDate = date
    await this.setState({ calendarDate: date })
    highlightCalendarDrag()
  }

  renderRecurringEvents(date) {
    this.setState({
      calendarDate: date,
      events: getRecurringEvents(date, this.state.events, this.props.viewType)
    })

    setTimeout(() => {
      renderHourlyPrices()
    })
  }

  isShowingCurrentPeriod() {
    const { calendarDate } = this.state
    const period = this.getViewType()
    const calendarPeriod = moment(calendarDate).get(period)
    const currentPeriod = moment(this.currentDate).get(period)

    return calendarPeriod === currentPeriod
  }

  render() {
    const selectedEvent = this.state.selectedEvent
    const { viewType, userType, offers } = this.props
    const {
      events,
      showNoEventsEnteredErrorMessage,
      selectionUnavailable,
      showPastDateSelectedError
    } = this.state

    return (
      <div>
        <div className="row">
          <div className={`col-md-8 
                           calendar-container
                           ${userType === 'buyer' ? ' buyer-view' : ' seller-view'}
                           ${viewType === 'daily' ? ' daily-view' : ' hourly-view'}`}>
            <div className="calendar-nav">
              <img onClick={this.prevPeriod} className="prev-period" src="/images/caret-dark.svg" />
              {!this.isShowingCurrentPeriod() &&
                <span className="go-to-today-btn" onClick={this.goToToday}>
                  <FormattedMessage
                    id={'calendar.goToToday'}
                    defaultMessage={
                      'Go to today'
                    }
                  />
                </span>
              }
              <img onClick={this.nextPeriod} className="next-period" src="/images/caret-dark.svg" />
            </div>
            <BigCalendar
              components={{
                dateCellWrapper: this.dateCellWrapper,
                month: {
                  header: this.monthHeader
                }
              }}
              selectable={ true }
              events={ [] }
              defaultView={ BigCalendar.Views[this.getViewType().toUpperCase()] }
              onSelectSlot={ this.onSelectSlot }
              step={ this.props.step || 60 }
              timeslots={ 1 }
              date={ this.state.calendarDate }
              onNavigate={ this.renderRecurringEvents }
              slotPropGetter={ this.slotPropGetter }
              scrollToTime={ moment(this.state.calendarDate).hour(8).toDate() }
              localizer={this.localizer}
            />
            {
              userType === 'seller' &&
              <div className="btn-container">
                {showNoEventsEnteredErrorMessage &&
                  <div className="info-box warn">
                    <p>
                      <FormattedMessage
                        id={'calendar.showNoEventsEnteredErrorMessage'}
                        defaultMessage={
                          'Please enter availability on the calendar'
                        }
                      />
                    </p>
                  </div>
                }
                <button className="btn btn-other" onClick={this.goBack}>
                  <FormattedMessage
                    id={'calendar.back'}
                    defaultMessage={
                      'Back'
                    }
                  />
                </button>
                <button className="btn btn-primary" onClick={this.saveData}>
                  <FormattedMessage
                    id={'calendar.next'}
                    defaultMessage={
                      'Next'
                    }
                  />
                </button>
              </div>
            }
          </div>
          <div className="col-md-4 calendar-right-column">
            {(!selectedEvent || !selectedEvent.start) && userType === 'seller' &&
              <div className="info-box">
                <h2>
                  <FormattedMessage
                    id={'listing-create.calendarCustomize'}
                    defaultMessage={'Customize Pricing & Availability'}
                  />
                </h2>
                <p>
                  <FormattedMessage
                    id={'calendar.calendarTipsSeller1'}
                    defaultMessage={
                      'Select one or more dates by clicking and dragging on the calendar.'
                    }
                  />
                </p>
                <p>
                  <FormattedMessage
                    id={'calendar.calendarTipsSeller2'}
                    defaultMessage={
                      'All dates are available by default and are priced according to your weekday and weekend pricing set in the listing details.'
                    }
                  />
                </p>
              </div>
            }
            {(!selectedEvent || !selectedEvent.start) && userType === 'buyer' &&
              <div className="info-box">
                <p>
                  <FormattedMessage
                    id={'calendar.calendarTipsBuyer1'}
                    defaultMessage={
                      'Select one or more dates that you would like to reserve by clicking and dragging on the calendar.'
                    }
                  />
                </p>
                <p>
                  <FormattedMessage
                    id={'calendar.calendarTipsBuyer2'}
                    defaultMessage={
                      'Your reservation will be for the night of each date that you include in your selection. Be sure to review the listing description for any special circumstances.'
                    }
                  />
                </p>
              </div>
            }
            {selectedEvent && selectedEvent.start &&
              <div className="calendar-cta">
                <p className="font-weight-bold">
                  {viewType === 'daily' &&
                    <FormattedMessage
                      id={'calendar.selectedDates'}
                      defaultMessage={
                        'Selected Dates'
                      }
                    />
                  }
                  {
                    viewType !== 'daily' &&
                    <FormattedMessage
                      id={'calendar.selectedTimes'}
                      defaultMessage={
                        'Selected Times'
                      }
                    />
                  }
                </p>
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <select
                        name="start"
                        className="form-control"
                        onChange={ this.onDateDropdownChange }
                        value={ selectedEvent.start.toString() }>
                        { 
                          getDateDropdownOptions(
                            selectedEvent.start,
                            viewType,
                            userType,
                            selectedEvent,
                            events,
                            offers
                          ).map((date) => (
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
                          getDateDropdownOptions(
                            selectedEvent.end,
                            viewType,
                            userType,
                            selectedEvent,
                            events,
                            offers
                          ).map((date) => (
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
                    <div>
                      <p className="font-weight-bold">
                        <FormattedMessage
                          id={'calendar.available'}
                          defaultMessage={
                            'Available'
                          }
                        />
                      </p>
                      <div>
                        <label htmlFor="available">
                          <FormattedMessage
                            id={'calendar.yes'}
                            defaultMessage={
                              'Yes'
                            }
                          />
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
                          <FormattedMessage
                            id={'calendar.no'}
                            defaultMessage={
                              'No'
                            }
                          />
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
                          <p className="font-weight-bold">
                            <FormattedMessage
                              id={'calendar.pricing'}
                              defaultMessage={
                                'Pricing'
                              }
                            />
                          </p>
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
                              &nbsp;ETH&nbsp;
                              <FormattedMessage
                                id={'calendar.perHour'}
                                defaultMessage={
                                  'per hour'
                                }
                              />
                            </span>
                          }
                          {viewType === 'daily' &&
                            <span className="price-label">
                              &nbsp;ETH&nbsp;
                              <FormattedMessage
                                id={'calendar.perDay'}
                                defaultMessage={
                                  'per day'
                                }
                              />
                            </span>
                          }
                        </Fragment>
                      }
                    </div>
                    {this.state.showSellerActionBtns &&
                      <div className="cta-btns row">
                        <div className="col-md-6">
                          <button className="btn" onClick={this.cancelEvent}>
                            <FormattedMessage
                              id={'calendar.cancel'}
                              defaultMessage={
                                'Cancel'
                              }
                            />
                          </button>
                        </div>
                        <div className="col-md-6">
                          <button className="btn" onClick={this.saveEvent}>
                            <FormattedMessage
                              id={'calendar.save'}
                              defaultMessage={
                                'Save'
                              }
                            />
                          </button>
                        </div>
                      </div>
                    }
                  </Fragment>
                }
                {userType === 'buyer' &&
                  <div>
                    <p className="font-weight-bold">
                      <FormattedMessage
                        id={'calendar.price'}
                        defaultMessage={
                          'Price'
                        }
                      />
                    </p>
                    <p>{selectedEvent.price && selectedEvent.price} ETH</p>
                    {!this.props.userIsSeller &&
                      <div className="cta-btns row">
                        <div className="col-md-6">
                          <button className="btn btn-dark" onClick={this.unselectSlots}>
                            <FormattedMessage
                              id={'calendar.cancel'}
                              defaultMessage={
                                'Cancel'
                              }
                            />
                          </button>
                        </div>
                        <div className="col-md-6">
                          <button className="btn btn-light" onClick={this.reserveSlots}>
                            <FormattedMessage
                              id={'calendar.reserve'}
                              defaultMessage={
                                'Reserve'
                              }
                            />
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            {selectionUnavailable &&
              <div className="info-box warn">
                <p>
                  <FormattedMessage
                    id={'calendar.selectionUnavailable'}
                    defaultMessage={
                      'Your selection contains one or more unavailable dates.'
                    }
                  />
                </p>
              </div>
            }
            {showPastDateSelectedError &&
              <div className="info-box warn">
                <p>
                  <FormattedMessage
                    id={'calendar.showPastDateSelectedError'}
                    defaultMessage={
                      'Past dates may not be selected.'
                    }
                  />
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

}

export default injectIntl(Calendar)
