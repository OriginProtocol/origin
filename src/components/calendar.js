import React, { Component, Fragment } from 'react'
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import uuid from 'uuid/v1'

class Calendar extends Component {

  constructor(props) {
    super(props)

    this.getEvents = this.getEvents.bind(this)
    this.setViewType = this.setViewType.bind(this)
    this.onSelectSlot = this.onSelectSlot.bind(this)
    this.onSelectEvent = this.onSelectEvent.bind(this)
    this.handlePriceChange = this.handlePriceChange.bind(this)
    this.saveEvent = this.saveEvent.bind(this)
    this.cancelEvent = this.cancelEvent.bind(this)
    this.onAvailabilityChange = this.onAvailabilityChange.bind(this)
    this.onDateDropdownChange = this.onDateDropdownChange.bind(this)
    this.onIsRecurringEventChange = this.onIsRecurringEventChange.bind(this)
    this.onRecurringDaysChange = this.onRecurringDaysChange.bind(this)
    this.saveData = this.saveData.bind(this)

    this.state = {
      events: [],
      selectedEvent: {
        price: 0,
        isAvailable: true,
        isRecurringEvent: false,
        recurringDays: []
      }
    }

    this.daysOfTheWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
  }

  componentWillMount() {
    BigCalendar.momentLocalizer(moment);
    this.getEvents()
  }

  getEvents() {
    // TODO - make API call to get events
    this.setState({
      events: []
    })
  }

  setViewType() {
    return this.props.viewType === 'daily' ? ['month'] : ['week']
  }

  onSelectSlot(slotInfo) {
    // if slot doesn't already contain an event, create an event
    let newEvent
    const existingEventInSlot = this.state.events.filter((event) => 
      event.slots[0].toString() === slotInfo.slots[0].toString()
    )

    if (!existingEventInSlot.length) {

      newEvent = {
        ...slotInfo,
        id: uuid(),
        end: moment(slotInfo.end).add(1, 'day').subtract(1, 'second').toDate()
      }

      this.setState({
        events: [
          ...this.state.events,
          newEvent
        ],
      })
    }

    this.onSelectEvent(existingEventInSlot[0] || newEvent)
  }

  onSelectEvent(selectedEvent) {
    this.setState({ 
      selectedEvent: {
        ...selectedEvent,
        price: selectedEvent.price || '',
        isAvailable: (selectedEvent.isAvailable !== undefined ? selectedEvent.isAvailable : true),
        isRecurringEvent: selectedEvent.isRecurringEvent || false,
        recurringDays: selectedEvent.recurringDays || []
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
          isRecurringEvent: false,
          recurringDays: []
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
  
    const allOtherEvents = this.state.events.filter((event) => event.id !== this.state.selectedEvent.id)

    const updatedEvent = {
      ...this.state.selectedEvent,
      [whichDropdown]: new Date(value),
      slots: getSlots()
    }

    this.setState({
      events: [
        ...allOtherEvents,
        updatedEvent
      ],
      selectedEvent: updatedEvent
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
    const isChecked = event.target.checked

    const updatedEvent = {
      ...this.state.selectedEvent,
      isRecurringEvent: isChecked
    }

    if (!isChecked) {
      updatedEvent.recurringDays = []
    }

    this.setState({
      selectedEvent: updatedEvent
    })
  }

  onRecurringDaysChange(event) {
    const selectedEvent = this.state.selectedEvent
    const thisDay = parseInt(event.target.id)
    const isChecked = event.target.checked
    const recurringDays = isChecked ?
                            [...selectedEvent.recurringDays, thisDay] :
                            selectedEvent.recurringDays.filter((day) => day !== thisDay )

    this.setState({
      selectedEvent: {
        ...selectedEvent,
        recurringDays
      }
    })
  }

  eventComponent(data) {
    const { event } = data
    const { isAvailable, price } = event

    return (
      <div className={ `calendar-event ${isAvailable !== false ? 'available' : 'unavailable'}` }>
        {price ?
          `${price} ETH`
          :
          'New Event'
        }
      </div>
    )
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

  render() {
    const selectedEvent = this.state.selectedEvent

    return (
      <div>
        <div className="row">
          <div className="col-md-8" style={{ height: '450px' }}>
            <BigCalendar
              components={ { event: this.eventComponent } }
              selectable={this.props.userType === 'seller'}
              events={this.state.events}
              views={this.setViewType()}
              onSelectEvent={this.onSelectEvent}
              onSelectSlot={this.onSelectSlot}
              step={ this.props.step || 60 }
            />
            <button className="btn btn-primary" onClick={this.saveData}>Next</button>
          </div>
          <div className="col-md-4">
            {selectedEvent && selectedEvent.start &&
              <div>
                <div>
                  <select
                    name="start"
                    className="form-control"
                    onChange={ this.onDateDropdownChange }
                    value={ selectedEvent.start.toString() }>
                    { 
                      this.getDateDropdownOptions(selectedEvent.start).map((date) => (
                        date < selectedEvent.end &&
                        <option
                          key={date.toString()}
                          value={date.toString()}>
                          {moment(date).format('MM/DD/YY')}
                        </option>
                      ))
                    }
                  </select>
                  <select
                    name="end"
                    className="form-control"
                    onChange={ this.onDateDropdownChange }
                    value={selectedEvent.end.toString()}>
                    { 
                      this.getDateDropdownOptions(selectedEvent.end).map((date) => (
                        date > selectedEvent.start &&
                        <option
                          key={date.toString()}
                          value={date.toString()}>
                          {moment(date).format('MM/DD/YY')}
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div>
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
                  <div>
                    {
                      selectedEvent.isRecurringEvent &&
                      this.daysOfTheWeek.map((day, i) => (
                        <Fragment key={ i }>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={ i }
                            checked={ selectedEvent.recurringDays.includes(i) }
                            onChange={ this.onRecurringDaysChange } />
                          <label className="form-check-label" htmlFor={ i }>
                            { day }
                          </label>
                        </Fragment>
                      ))
                    }
                  </div>
                </div>
                <div>
                  <p>Availability</p>
                  <div className="form-check">
                    <input 
                      className="form-check-input"
                      type="radio"
                      name="isAvailable"
                      id="available"
                      value="1"
                      onChange={ this.onAvailabilityChange }
                      checked={ selectedEvent.isAvailable } />
                    <label className="form-check-label" htmlFor="available">
                      Availaible
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="isAvailable"
                      id="unavailable"
                      value="0"
                      onChange={ this.onAvailabilityChange }
                      checked={ !selectedEvent.isAvailable } />
                    <label className="form-check-label" htmlFor="unavailable">
                      Unavailable
                    </label>
                  </div>
                  <input 
                    placeholder="Price"
                    name="price"
                    type="number"
                    step="0.00001"
                    value={selectedEvent.price} 
                    onChange={this.handlePriceChange} 
                  />
                </div>
                <button className="btn btn-secondary" onClick={this.cancelEvent}>Cancel</button>
                <button className="btn btn-primary" onClick={this.saveEvent}>Save</button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

}

export default Calendar
