import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import 'react-dates/initialize'
import { START_DATE, END_DATE } from 'react-dates/src/constants'
import { DateRangePicker, SingleDatePicker, DayPickerRangeController, DayPickerRangeControllerWrapper } from 'react-dates'
import $ from 'jquery'

class DateFilterGroup extends Component {
  constructor(props) {
    super(props)

    this.state = {
      focusedInput: START_DATE,
      startDate: null,
      endDate: null,
      autoFocusEndDate: false
    }

    this.onDatesChange = this.onDatesChange.bind(this)
    this.onFocusChange = this.onFocusChange.bind(this)
    this.heighCorrected = false
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
    /* Workaround for a weird bug where DayPickerRangeController is hidden when in a 
     * Bootstrap dropdown
     */
    $('.dateFilter .DayPicker').removeClass('DayPicker__hidden')
  }

  onOpen() {
    /* Ugly ugly hack... Since we forcefully remove 'DayPicker__hidden' class from DayPicker 
     * component the component does not trigger vertical resize. For this reason we forcefully
     * resize the component on first show to mitigate the problem. 
     */
    if (!this.heighCorrected) {
      $('.DayPicker_transitionContainer').height(320)
      this.heighCorrected = true
    }
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate })
  }

  onFocusChange(focusedInput) {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? START_DATE : focusedInput,
    })
  }

  // Called by filter-group
  onClear() {

  }


  render() {
    const { focusedInput, startDate, endDate } = this.state;
    const startDateString = startDate ? startDate.format('l') :
      this.props.intl.formatMessage({
        id: 'dateFilter.startDate',
        defaultMessage: 'Start Date'
      })
    const endDateString = endDate ? endDate.format('l') :
      this.props.intl.formatMessage({
        id: 'dateFilter.endDate',
        defaultMessage: 'End Date'
      })

    return (
      <div className="dateFilter">
        <div className="mb-2">
          <input type="text" className="date-readonly-input mr-3" name="start date" value={startDateString} readOnly />
           - 
          <input type="text" className="date-readonly-input ml-3" name="end date" value={endDateString} readOnly />
        </div>

        <DayPickerRangeController
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
          numberOfMonths={2}
          hideKeyboardShortcutsPanel={true}
        />
      </div>
    )
  }
}

export default injectIntl(DateFilterGroup)
