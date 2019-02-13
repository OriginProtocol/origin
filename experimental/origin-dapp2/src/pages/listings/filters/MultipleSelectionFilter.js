import React, { Component } from 'react'
import Categories from 'origin-graphql/src/constants/Categories'
import listingSchemaMetadata from 'utils/listingSchemaMetadata'
import schemaMessages from '../../../schemaMessages/index'

export const FILTER_OPERATOR_EQUALS = 'EQUALS'
export const FILTER_OPERATOR_CONTAINS = 'CONTAINS' //for array values where at least one must match E.g. list of categories
export const FILTER_OPERATOR_GREATER = 'GREATER'
export const FILTER_OPERATOR_GREATER_OR_EQUAL = 'GREATER_OR_EQUAL'
export const FILTER_OPERATOR_LESSER = 'LESSER'
export const FILTER_OPERATOR_LESSER_OR_EQUAL = 'LESSER_OR_EQUAL'

export const VALUE_TYPE_STRING = 'STRING'
export const VALUE_TYPE_FLOAT = 'FLOAT'
export const VALUE_TYPE_DATE = 'DATE'
export const VALUE_TYPE_ARRAY_STRING = 'ARRAY_STRING'

const categories = Categories.root.map(c => ({
  id: c[0],
  type: c[0].split('.').slice(-1)[0]
}))
categories.unshift({ id: '', type: '' })
class MultipleSelectionFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checkboxValue: {}
    }

    this.onHandleClick = this.onHandleClick.bind(this)
    this.multipleSelectionValues = listingSchemaMetadata.listingSchemasByCategory[
      props.category.type
    ].map(subCategory => subCategory.translationName.id)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  // Called by filter-group
  async getFilters() {
    const values = Object.keys(this.state.checkboxValue)
      //keep only selected values
      .filter(checkBoxKey => this.state.checkboxValue[checkBoxKey])

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

  // componentDidUpdate(previousProps) {
  //   // When new search is triggered, search filters get reset, so component should reset their state
  //   if (this.props.generalSearchId !== previousProps.generalSearchId)
  //     this.onClear()
  // }

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

  render() {
    let containerClass = 'd-flex flex-column'
    let itemClass = 'form-check'

    /* Render items into 1 column when under 9 elements,
     * into 2 columns when between 10 and 19 elements,
     * and into 3 columns when 20 or more.
     */
    if (this.multipleSelectionValues.length > 19) {
      containerClass = 'd-flex flex-wrap three-column-container'
      itemClass = 'form-check limit-checkbox-three-columns'
    } else if (this.multipleSelectionValues.length > 9) {
      containerClass = 'd-flex flex-wrap two-column-container'
      itemClass = 'form-check limit-checkbox-two-columns'
    }

    return (
      <div className={containerClass} key={this.props.title}>
        {this.multipleSelectionValues.map(multipleSelectionValue => (
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
              {schemaMessages[multipleSelectionValue].defaultMessage}
            </label>
          </div>
        ))}
      </div>
    )
  }
}

export default MultipleSelectionFilter
