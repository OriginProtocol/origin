import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import schemaMessages from '../../schemaMessages/index'

class MultipleSelectionFilter extends Component {
  constructor(props){
    super(props)

    this.state = {
      checkboxValue:{}
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
  onClear() {
    this.setState({ checkboxValue:{} })
  }

  onHandleClick(event) {
    let stateObject = this.state
    stateObject.checkboxValue[event.target.getAttribute("id")] = true

    this.setState(stateObject)
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

    const renderElementsIn2Rows = this.props.multipleSelectionValues.length > 9

    return (
      <div className={containerClass} key={this.props.title}>
      {this.props.multipleSelectionValues.map(multipleSelectionValue =>
        <div className={itemClass} key={multipleSelectionValue}>
          <input
            type="checkbox"
            className="form-check-input"
            id={multipleSelectionValue}
            onClick={this.onHandleClick}
            checked={this.state.checkboxValue[multipleSelectionValue] ? this.state.checkboxValue[multipleSelectionValue] : false}
          />
          <label htmlFor={multipleSelectionValue}>
            {
              this.props.intl.formatMessage(schemaMessages[_.camelCase(this.props.listingType)][multipleSelectionValue])
            }
          </label>
        </div>
      )}
      </div>
    )
  }
}

export default injectIntl(MultipleSelectionFilter)
