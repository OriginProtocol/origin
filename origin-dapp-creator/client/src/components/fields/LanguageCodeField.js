import React, { Component } from 'react'
import { HTMLSelect, FormGroup } from '@blueprintjs/core'

import { getAvailableLanguages } from 'origin-dapp/src/utils/translationUtils.js'

class LanguageCodeField extends Component {

  constructor (props) {
    super(props)

    this.availableLanguages = getAvailableLanguages().map((language) => {
      return {
        value: language.selectedLanguageCode,
        label: language.selectedLanguageFull
      }
    })

    this.availableLanguages.unshift({ value: 'en-US', label: 'English' })

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.props.onChange(event)
  }

  render () {
    return (
      <FormGroup
          label="Language Code"
          labelFor="languageCode">
        <HTMLSelect name="languageCode"
          options={this.availableLanguages}
          onChange={this.handleChange} />
      </FormGroup>
    )
  }
}

export default LanguageCodeField
