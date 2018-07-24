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

    this.state = {
      events: [],
      selectedEvent: {
        price: 0,
        isAvailable: true,
        isRecurringEvent: false
      },
      buyerSelectedSlotData: null,
      defaultDate: new Date()
    }
  }

  componentWillMount() {
    BigCalendar.momentLocalizer(moment);
    
    const events = this.props.slots && this.props.slots.map((slot) =>  {
      return { 
        id: uuid(),
        start: slot.startDate,
        end: slot.endDate,
        price: slot.priceWei,
        isAvailable: slot.isAvailable,
        slots: slot.slots
      }
    })

    this.setState({
      events: (events || [])
    })
  }

  componentDidMount() {
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
        const priceIdx = classes.indexOf('priceEth-')

        if (priceIdx > -1) {
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

  onSelectSlot(slotInfo) {
    if (this.props.userType === 'seller') {
      // if slot doesn't already contain an event, create an event
      let newEvent
      const existingEventInSlot = this.state.events.filter((event) => 
        event.slots[0].toString() === slotInfo.slots[0].toString()
      )

      if (!existingEventInSlot.length) {

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

      this.onSelectEvent(existingEventInSlot[0] || newEvent)
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

  onSelectEvent(selectedEvent) {
    this.setState({ 
      selectedEvent: {
        ...selectedEvent,
        price: selectedEvent.price || '',
        isAvailable: (selectedEvent.isAvailable !== undefined ? selectedEvent.isAvailable : true),
        isRecurringEvent: selectedEvent.isRecurringEvent || false
      }
    })
  }

  handlePriceChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        price: (event.target.value && parseFloat(event.target.value))
      }
    })
  }

  saveEvent() {
    const allOtherEvents = this.state.events.filter((event) => event.id !== this.state.selectedEvent.id)

    this.setState({
      events: [...allOtherEvents, this.state.selectedEvent]
    })
  }

  cancelEvent() {
    const confirmation = confirm('Are you sure you want to delete this event?')

    if (confirmation) {
      const allOtherEvents = this.state.events.filter((event) => event.id !== this.state.selectedEvent.id)

      this.setState({
        events: [...allOtherEvents],
        selectedEvent: {
          price: 0,
          isAvailable: true,
          isRecurringEvent: false
        }
      })
    }
  }

  onAvailabilityChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        isAvailable: !!parseInt(!isNaN(event.target.value) && event.target.value)
      }
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

        if (whichDropdown === 'start') {

          slots.push(slotDate.toDate())
          slotDate = slotDate.add(1, 'days')

        } else {

          slots.unshift(slotDate.toDate())
          slotDate = slotDate.subtract(1, 'days')

        }
      }

      return slots
    }

    this.onSelectSlot({
      ...this.state.selectedEvent,
      slots: getSlots(),
      [whichDropdown]: new Date(value)
    })
  }

  getDateDropdownOptions(date) {
    return [
      ...[...Array(10)].map((_, i) => moment(date).subtract(i + 1, 'days').toDate()).reverse(),
      moment(date).toDate(),
      ...[...Array(10)].map((_, i) => moment(date).add(i + 1, 'days').toDate())
    ]
  }

  onIsRecurringEventChange(event) {
    this.setState({
      ...this.state.selectedEvent,
      isRecurringEvent: event.target.checked
    })
  }

  eventComponent(data) {
    const { event } = data
    const { isAvailable, price } = event
    const stepAbbrev = this.props.step === 60 ? 'hr' : `${this.props.step} min.`
    const perTimePeriod = this.props.viewType === 'hourly' ? ` /${stepAbbrev}` : ''

    return (
      <div className={ `calendar-event ${isAvailable !== false ? 'available' : 'unavailable'}` }>
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
    const events = this.state.events
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
          toReturn = {
            isAvailable: !this.isDateBooked(date),
            price: event.price,
            start: event.start,
            end: event.end
          }
        }
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
    const cleanEvents = this.state.events.length && this.state.events.map((event) => {
      return {
        startDate: event.start.toISOString(),
        endDate: event.end.toISOString(),
        isAvailable: event.isAvailable,
        priceWei: event.price
      }
    })
    this.props.onComplete && this.props.onComplete(cleanEvents)
  }

  goBack() {
    this.props.onGoBack && this.props.onGoBack()
  }

  reserveSlots() {
    const slotsToReserve = this.state.buyerSelectedSlotData &&
                            this.state.buyerSelectedSlotData.map((slot) => {
                              return {
                                startDate: slot.start,
                                endDate: slot.end,
                                priceWei: slot.price
                              }
                            })
    this.props.onComplete && this.props.onComplete(slotsToReserve)
  }

  unselectSlots() {
    this.setState({
      selectedEvent: {}
    })
  }

  buyerPrevMonth() {
    this.setState({
      defaultDate: moment(this.state.defaultDate).subtract(1, this.setViewType()).toDate()
    })
  }

  buyerNextMonth() {
    this.setState({
      defaultDate: moment(this.state.defaultDate).add(1, this.setViewType()).toDate()
    })
  }

  render() {
    const selectedEvent = this.state.selectedEvent

    return (
      <div>
        <div className="row">
          <div className={`col-md-8 
                           calendar-container
                           ${this.props.userType === 'buyer' ? ' buyer-view' : ''}
                           ${this.props.viewType === 'daily' ? ' daily-view' : ' hourly-view'}`}>
            {
              this.props.userType === 'buyer' &&
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
              events={ (this.props.userType === 'seller' && this.state.events) || [] }
              defaultView={ BigCalendar.Views[this.setViewType().toUpperCase()] }
              onSelectEvent={ this.onSelectEvent }
              onSelectSlot={ this.onSelectSlot }
              step={ this.props.step || 60 }
              timeslots={ 1 }
              date={ this.state.defaultDate }
              onNavigate={ (date) => { this.setState({ defaultDate: date }) } }
              slotPropGetter={ this.slotPropGetter }
            />
            {
              this.props.userType === 'seller' &&
              <div className="btn-container">
                <button className="btn btn-other" onClick={this.goBack}>Back</button>
                <button className="btn btn-primary" onClick={this.saveData}>Next</button>
              </div>
            }
          </div>
          <div className="col-md-4">
            {selectedEvent && selectedEvent.start &&
              <div className="calendar-cta">
                <p className="font-weight-bold">Selected { this.props.viewType === 'daily' ? 'dates' : 'times' }</p>
                <div>
                  {this.props.viewType === 'daily' &&
                    <div className="row">
                      <div className="col-md-6">
                        <select
                          name="start"
                          className="form-control"
                          onChange={ this.onDateDropdownChange }
                          value={ selectedEvent.start.toString() }>
                          { 
                            this.getDateDropdownOptions(selectedEvent.start).map((date) => (
                              date <= selectedEvent.end &&
                              <option
                                key={date.toString()}
                                value={date.toString()}>
                                {moment(date).format('MM/DD/YY')}
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
                              date >= selectedEvent.start &&
                              <option
                                key={date.toString()}
                                value={date.toString()}>
                                {moment(date).format('MM/DD/YY')}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  }
                  {this.props.viewType === 'hourly' &&
                    <Fragment>
                      <p>{moment(selectedEvent.start).format('LT')} - {moment(selectedEvent.end).format('LT')}</p>
                    </Fragment>
                  }
                </div>
                {this.props.userType === 'seller' &&
                  <Fragment>
                    {/* Commenting out until we implement recurring events completely
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
                    </div> */}
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
                            this.props.viewType === 'hourly' &&
                            this.props.step &&
                            <span className="price-label">
                              &nbsp;ETH per {this.props.intl.formatNumber(this.props.step)} min.
                            </span>
                          }
                          {this.props.viewType === 'daily' &&
                            <span className="price-label">&nbsp;ETH</span>
                          }
                        </Fragment>
                      }
                    </div>
                    <div className="cta-btns row">
                      <div className="col-md-6">
                        <button className="btn btn-dark" onClick={this.cancelEvent}>Cancel</button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-light" onClick={this.saveEvent}>Save</button>
                      </div>
                    </div>
                  </Fragment>
                }
                {this.props.userType === 'buyer' &&
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
