import React, { Component } from 'react'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'

// sample list of available countries for phone number prefix
class CountryOptions extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      unitedStates: {
        id: '_countryOptions.unitedStates',
        defaultMessage: 'United States'
      },
      china: {
        id: '_countryOptions.china',
        defaultMessage: 'China'
      },
      japan: {
        id: '_countryOptions.japan',
        defaultMessage: 'Japan'
      },
      germany: {
        id: '_countryOptions.germany',
        defaultMessage: 'Germany'
      },
      france: {
        id: '_countryOptions.france',
        defaultMessage: 'France'
      },
      russia: {
        id: '_countryOptions.russia',
        defaultMessage: 'Russia'
      },
      brazil: {
        id: '_countryOptions.brazil',
        defaultMessage: 'Brazil'
      },
      italy: {
        id: '_countryOptions.italy',
        defaultMessage: 'Italy'
      },
      unitedKingdom: {
        id: '_countryOptions.unitedKingdom',
        defaultMessage: 'United Kingdom'
      },
      southKorea: {
        id: '_countryOptions.southKorea',
        defaultMessage: 'South Korea'
      },
      newZealand: {
        id: '_countryOptions.newZealand',
        defaultMessage: 'New Zealand'
      }
    })

    this.countryOptions = [
      {
        code: 'us',
        name: this.props.intl.formatMessage(this.intlMessages.unitedStates),
        prefix: '1'
      },
      {
        code: 'cn',
        name: this.props.intl.formatMessage(this.intlMessages.china),
        prefix: '86'
      },
      {
        code: 'jp',
        name: this.props.intl.formatMessage(this.intlMessages.japan),
        prefix: '81'
      },
      {
        code: 'de',
        name: this.props.intl.formatMessage(this.intlMessages.germany),
        prefix: '49'
      },
      {
        code: 'fr',
        name: this.props.intl.formatMessage(this.intlMessages.france),
        prefix: '33'
      },
      {
        code: 'ru',
        name: this.props.intl.formatMessage(this.intlMessages.russia),
        prefix: '7'
      },
      {
        code: 'br',
        name: this.props.intl.formatMessage(this.intlMessages.brazil),
        prefix: '55'
      },
      {
        code: 'it',
        name: this.props.intl.formatMessage(this.intlMessages.italy),
        prefix: '39'
      },
      {
        code: 'gb',
        name: this.props.intl.formatMessage(this.intlMessages.unitedKingdom),
        prefix: '44'
      },
      {
        code: 'kr',
        name: this.props.intl.formatMessage(this.intlMessages.southKorea),
        prefix: '82'
      },
      {
        code: 'nz',
        name: this.props.intl.formatMessage(this.intlMessages.newZealand),
        prefix: '64'
      }
    ]
  }

  render() {
    return (
      <div>
        {this.countryOptions.map(c => (
          <div
            key={c.prefix}
            className="dropdown-item d-flex"
            onClick={() => {
              this.props.setSelectedCountry(c)
            }}
          >
            <div>
              <img
                src={`images/flags/${c.code}.svg`}
                role="presentation"
                alt={`${c.code.toUpperCase()} flag`}
              />
            </div>
            <div>{c.name}</div>
            <div>+{c.prefix}</div>
          </div>
        ))}
      </div>
    )
  }
}

export default connect()(injectIntl(CountryOptions))
