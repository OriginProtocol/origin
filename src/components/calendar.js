import React, { Component } from 'react'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

class Calendar extends Component {

  constructor(props) {
    super(props)

  }

  componentWillMount() {
    BigCalendar.momentLocalizer(moment);
  }

  render() {
    return (
      <div className="calendar-container" style={{ height: '350px' }}>
        <BigCalendar
          events={[]}
          views={['month', 'week']}
          // startAccessor='startDate'
          // endAccessor='endDate'
        />
      </div>
    )
  }

}

export default Calendar
