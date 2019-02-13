import React, { Component } from 'react'
import Categories from 'origin-graphql/src/constants/Categories'
import listingSchemaMetadata from 'utils/listingSchemaMetadata'
import schemaMessages from '../../../schemaMessages/index'
import {
  FILTER_OPERATOR_CONTAINS,
  VALUE_TYPE_ARRAY_STRING
} from 'constants/Filters'

const categories = Categories.root.map(c => ({
  id: c[0],
  type: c[0].split('.').slice(-1)[0]
}))
categories.unshift({ id: '', type: '' })

function getCssClasses(valuesLength) {
  const oneColumn = {
    containerClass: 'd-flex flex-column',
    itemClass: 'form-check'
  }
  const twoColumns = {
    containerClass: 'd-flex flex-wrap two-column-container',
    itemClass: 'form-check limit-checkbox-two-columns'
  }
  const threeColumns = {
    containerClass: 'd-flex flex-wrap three-column-container',
    itemClass: 'form-check limit-checkbox-three-columns'
  }

  if (valuesLength > 19) {
    return threeColumns
  } else if (valuesLength > 9) {
    return twoColumns
  } else {
    return oneColumn
  }
}

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
    const { containerClass, itemClass } = getCssClasses(
      this.multipleSelectionValues.length
    )

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
