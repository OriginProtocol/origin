import React, { Component } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'

class BoostLimitField extends Component {
  constructor(props) {
    super(props)
    
    /* Set default multi-unit boost limit to the amount required to boost all listings with 
     * selected boost value. Except if user does not have enough OGN
     */
    this.state = {
      boostLimit: this.calculateMaxPossibleBoost(props)
    }

    this.intlMessages = defineMessages({
      'title': {
        id: 'schema.boostLimit',
        defaultMessage: 'Boost Limit'
      }
    })
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { boostLimit } = this.state
    if (boostLimit) {
      setTimeout(() => {
        this.props.onChange(boostLimit)
      })
    }
  }

  componentDidUpdate(prevProps) {
    const maxPossibleBoost = this.calculateMaxPossibleBoost(this.props)
    // user is changing boost slider
    if (this.props.formContext.formData.boostValue !== prevProps.formContext.formData.boostValue &&
      maxPossibleBoost !== this.state.boostLimit){

      this.setState({
        boostLimit: maxPossibleBoost
      })

      // prevent too many subsequent state updates of the parent
      if (this.boostLimitCallback)
        clearTimeout(this.boostLimitCallback)

      this.boostLimitCallback = setTimeout(() => {
        this.props.onChange(maxPossibleBoost)
      }, 50)
    }
  }

  calculateMaxPossibleBoost(props) {
    return Math.min(
      props.formContext.formData.unitsTotal * props.formContext.formData.boostValue,
      props.formContext.wallet.ognBalance
    )
  }

  onChange(event) {
    const value = event.target.value

    this.setState({
        boostLimit: value
      },
      () => this.props.onChange(value)
    )
  }

  render() {
    const { boostLimit } = this.state
    return (
      (
        <div className="boost-limit-field">
          <label className="control-label" htmlFor="boostLimit">
            {this.props.intl.formatMessage(this.intlMessages.title)}
            {this.props.required && <span className="required">*</span>}
          </label>
          <div className="row">
            <div className="col-12">
              <div className="price-field-container">
                <input
                  type="number"
                  id="boostLimit"
                  step="0.00001"
                  value={boostLimit}
                  className="price-field form-control"
                  onChange={this.onChange}
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
