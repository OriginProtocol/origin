import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import {
  FILTER_OPERATOR_CONTAINS,
  VALUE_TYPE_ARRAY_STRING
} from 'components/search/constants'

import schemaMessages from '../../schemaMessages/index'

class MultipleSelectionFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checkboxValue: {}
    }

    this.onHandleClick = this.onHandleClick.bind(this)
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  // Called by filter-group
  async getFilters() {
    const values = Object.keys(this.state.checkboxValue)
      //keep only selected values
      .filter(checkBoxKey => this.state.checkboxValue[checkBoxKey])

    // do not translate anything from the schema
    // .map(untranslatedValue => {
    //   return schemaMessages[this.toCamelCase(this.props.listingType)][untranslatedValue]
    //     .defaultMessage
    // })

    if (values.length === 0) return []
    else
      return [
        {
          name: this.props.filter.searchParameterName,
          value: values,
          valueType: VALUE_TYPE_ARRAY_STRING,
          operator: FILTER_OPERATOR_CONTAINS
        }
      ]
  }

  componentDidUpdate(previousProps) {
    // When new search is triggered, search filters get reset, so component should reset their state
    if (this.props.generalSearchId !== previousProps.generalSearchId)
      this.onClear()
  }

  // Called by filter-group
  onClear(callback) {
    this.setState({ checkboxValue: {} }, callback)
  }

  onHandleClick(event) {
    const stateObject = this.state
    const currentVal =
      stateObject.checkboxValue[event.target.getAttribute('id')]

    stateObject.checkboxValue[event.target.getAttribute('id')] = !currentVal

    this.setState(stateObject)
  }

  toCamelCase(string) {
    return string
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
      })
      .replace(/-+/g, '')
  }

  render() {
    let containerClass = 'd-flex flex-column'
    let itemClass = 'form-check'

    /* Render items into 1 column when under 9 elements,
     * into 2 columns when between 10 and 19 elements,
     * and into 3 columns when 20 or more.
     */
    if (this.props.multipleSelectionValues.length > 19) {
      containerClass = 'd-flex flex-wrap three-column-container'
      itemClass = 'form-check limit-checkbox-three-columns'
    } else if (this.props.multipleSelectionValues.length > 9) {
      containerClass = 'd-flex flex-wrap two-column-container'
      itemClass = 'form-check limit-checkbox-two-columns'
    }

    return (
      <div className={containerClass} key={this.props.title}>
        {this.props.multipleSelectionValues.map(multipleSelectionValue => (
          <div className={itemClass} key={multipleSelectionValue}>
            <input
              type="checkbox"
              className="form-check-input"
              id={multipleSelectionValue}
              onClick={this.onHandleClick}
              checked={
                this.state.checkboxValue[multipleSelectionValue]
                  ? this.state.checkboxValue[multipleSelectionValue]
                  : false
              }
            />
            <label htmlFor={multipleSelectionValue}>
              {this.props.intl.formatMessage(
                schemaMessages[this.toCamelCase(this.props.listingType.type)][
                  multipleSelectionValue
                ]
              )}
            </label>
          </div>
        ))}
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
)(injectIntl(MultipleSelectionFilter))
