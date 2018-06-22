import React, { Component } from 'react'
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

    this.state = {
      events: [],
      selectedEvent: {
        price: 0
      }
    }
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
        title: selectedEvent.title || '',
      }
    })
  }

  handlePriceChange(event) {
    this.setState({
      selectedEvent: {
        ...this.state.selectedEvent,
        title: parseFloat(event.target.value)
      }
    })
  }

  saveEvent() {
    const allOtherEvents = this.state.events.filter((event) => event.id !== this.state.selectedEvent.id)

    this.setState({
      events: [...allOtherEvents, this.state.selectedEvent]
    })
  }

  render() {
    const selectedEvent = this.state.selectedEvent

    return (
      <div>
        <div className="row">
          <div className="col-md-8" style={{ height: '450px' }}>
            <BigCalendar
              selectable={this.props.userType === 'seller'}
              events={this.state.events}
              views={this.setViewType()}
              onSelectEvent={this.onSelectEvent}
              onSelectSlot={this.onSelectSlot}
            />
          </div>
          <div className="col-md-4">
            {selectedEvent && selectedEvent.start &&
              <div>
                <p>
                  {moment(selectedEvent.start).format('MM/DD/YY')} - 
                  {moment(selectedEvent.end).format('MM/DD/YY')}
                </p>
                <input 
                  placeholder="Price"
                  name="price"
                  type="number"
                  step="0.00001"
                  value={selectedEvent.title} 
                  onChange={this.handlePriceChange} 
                />
                <button className="btn" onClick={this.saveEvent}>Save</button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

}

export default Calendar
