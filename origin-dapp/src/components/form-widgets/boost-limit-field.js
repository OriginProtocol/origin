import React, { Component } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'

class BoostLimitField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      boostLimit: props.formData && parseFloat(props.formData) || '',
    }

    this.intlMessages = defineMessages({
      'title': {
        id: 'schema.boostLimit',
        defaultMessage: 'Boost Limit'
      }
    })
  }

  componentDidMount() {
    // If a price is passed in, we must call the onChange callback
    // to set the price in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { boostLimit } = this.state
    if (boostLimit) {
      setTimeout(() => {
        this.props.onChange(boostLimit)
      })
    }
  }

  onChange() {
    return async event => {
      const value = event.target.value
      const isNan = value === '' || isNaN(value)
      const valueNum = isNan ? value : parseFloat(value)
      if (valueNum < 0) {
        return
      }
      this.setState(
        {
          boostLimit: valueNum
        },
        () => this.props.onChange(valueNum)
      )
    }
  }

  render() {
    const { boostLimit } = this.state

    return (
      (
        <div className="boost-limit-field">
          <label className="control-label" htmlFor="root_boostLimit">
            {this.props.intl.formatMessage(this.intlMessages.title)}
            {this.props.required && <span className="required">*</span>}
          </label>
          <div className="row">
            <div className="col-12">
              <div className="price-field-container">
                <input
                  type="number"
                  id="root_boostLimit"
                  step="0.00001"
                  className="price-field form-control"
                  value={boostLimit}
                  onChange={this.onChange()}
                  required={this.props.required}
                />
                <span className="currency-badge currency-ogn">
                  <img src="images/ogn-icon.svg" role="presentation" />
                  OGN
                </span>
              </div>
            </div>
          </div>
          <p className="help-block mt-2">
            <FormattedMessage
              id={'boost-limit-field.boost-help'}
              defaultMessage={'Maximum amount that will be spent to boost this listing.'}
            />
          </p>
        </div>
      )
    )
  }
}

export default injectIntl(BoostLimitField)
