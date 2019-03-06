import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class UnnamedUser extends Component {
  render() {
    return (
      <FormattedMessage
        id={'Profile.unnamedUser'}
        defaultMessage={'Unnamed User'}
      />
    )
  }
}

export default UnnamedUser
