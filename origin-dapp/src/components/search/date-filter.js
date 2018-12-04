import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import 'react-dates/initialize'
import {
  VALUE_TYPE_DATE,
  FILTER_OPERATOR_GREATER_OR_EQUAL,
  FILTER_OPERATOR_LESSER_OR_EQUAL
} from 'components/search/constants'
import { DayPickerRangeController } from 'react-dates'

import { START_DATE } from 'react-dates/src/constants'

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
    // TODO - reimplement now that we no longer use jQuery
  }

  onOpen() {
    /* Ugly ugly hack... Since we forcefully remove 'DayPicker__hidden' class from DayPicker
     * component the component does not trigger vertical resize. For this reason we forcefully
     * resize the component on first show to mitigate the problem.
     */
    // TODO - reimplement now that we no longer use jQuery
    // if (!this.heighCorrected) {
    //   $('.DayPicker_transitionContainer').height(320)
    //   this.heighCorrected = true
    // }
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate })
  }

  onFocusChange(focusedInput) {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? START_DATE : focusedInput
    })
  }

  componentDidUpdate(previousProps) {
    // When new search is triggered, search filters get reset, so component should reset their state
    if (this.props.generalSearchId !== previousProps.generalSearchId)
      this.onClear()
  }

  // Called by filter-group
  async getFilters() {
    if (this.state.startDate !== null && this.state.endDate !== null)
      return [
        {
          name: this.props.filter.searchParameterName,
          value: this.state.startDate,
          valueType: VALUE_TYPE_DATE,
          operator: FILTER_OPERATOR_GREATER_OR_EQUAL
        },
        {
          name: this.props.filter.searchParameterName,
          value: this.state.endDate,
          valueType: VALUE_TYPE_DATE,
          operator: FILTER_OPERATOR_LESSER_OR_EQUAL
        }
      ]
    else return []
  }

  // Called by filter-group
  onClear(callback) {
    this.setState(
      {
        startDate: null,
        endDate: null
      },
      callback
    )
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state
    const startDateString = startDate
      ? startDate.format('l')
      : this.props.intl.formatMessage({
        id: 'dateFilter.startDate',
        defaultMessage: 'Start Date'
      })
    const endDateString = endDate
      ? endDate.format('l')
      : this.props.intl.formatMessage({
        id: 'dateFilter.endDate',
        defaultMessage: 'End Date'
      })

    return (
      <div className="dateFilter">
        <div className="mb-2">
          <input
            type="text"
            className="date-readonly-input mr-3"
            name="start date"
            value={startDateString}
            readOnly
          />
          -
          <input
            type="text"
            className="date-readonly-input ml-3"
            name="end date"
            value={endDateString}
            readOnly
          />
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

const mapStateToProps = state => ({
  filters: state.search.filters,
  generalSearchId: state.search.generalSearchId
})

const mapDispatchToProps = () => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DateFilterGroup))
