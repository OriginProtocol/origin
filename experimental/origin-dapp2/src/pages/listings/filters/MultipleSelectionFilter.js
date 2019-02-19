import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Categories from 'origin-graphql/src/constants/Categories'
import listingSchemaMetadata from 'utils/listingSchemaMetadata'
const CategoriesEnum = require('Categories$FbtEnum')

import {
  FILTER_OPERATOR_CONTAINS,
  VALUE_TYPE_ARRAY_STRING
} from 'constants/Search'

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

    this.onChange = this.onChange.bind(this)
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

  async getFilters() {
    const values = Object.keys(this.state.checkboxValue)
    const selectedValues = values.filter(
      checkBoxKey => this.state.checkboxValue[checkBoxKey]
    )

    if (selectedValues.length === 0) return []
    else
      return [
        {
          name: this.props.filter.searchParameterName,
          value: selectedValues,
          valueType: VALUE_TYPE_ARRAY_STRING,
          operator: FILTER_OPERATOR_CONTAINS
        }
      ]
  }

  onClear(callback) {
    this.setState({ checkboxValue: {} }, callback)
  }

  onChange(event) {
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
              onChange={this.onChange}
              checked={
                this.state.checkboxValue[multipleSelectionValue]
                  ? this.state.checkboxValue[multipleSelectionValue]
                  : false
              }
            />
            <label htmlFor={multipleSelectionValue}>
              <fbt desc="multipleSelection.message">
                <fbt:param name="selectionValue">
                  {CategoriesEnum[multipleSelectionValue]}
                </fbt:param>
              </fbt>
            </label>
          </div>
        ))}
      </div>
    )
  }
}

export default MultipleSelectionFilter
