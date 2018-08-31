import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import schemaMessages from '../../schemaMessages/index'

class CounterFilter extends Component {
  render() {
    const title = this.props.intl.formatMessage(this.props.filter.title)

    return (
      <div className="d-flex flex-row" key={title}>
        <div className="label mr-auto">title</div>
        <div className="label">XX</div>
        <div className="label">1</div>
        <div className="label">XX</div>
      </div>
    )
  }
}

export default injectIntl(CounterFilter)
