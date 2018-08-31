import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import schemaMessages from '../../schemaMessages/index'

class MultipleSelectionFilter extends Component {
  render() {
    return (
      <div className="d-flex flex-column flex-wrap" key={this.props.title}>
      {this.props.multipleSelectionValues.map(multipleSelectionValue =>
        <div className="form-check" key={multipleSelectionValue}>
          <input type="checkbox" className="form-check-input" id={multipleSelectionValue}/>
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
