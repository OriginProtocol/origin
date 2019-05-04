'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this._selectStack()
  }

  _selectStack() {
    const onboardingComplete = this.props.wallet.accounts.length > 0 &&
      this.props.settings.emailAddress &&
      (this.props.settings.pinCode || this.props.settings.biometryType)

    if (!onboardingComplete) {
      this.props.navigation.navigate('Onboarding')
    } else {
      this.props.navigation.navigate('App')
    }
  }

  render() {
    return <></>
  }
}

const mapStateToProps = ({ activation, settings, wallet }) => {
  return { activation, settings, wallet }
}

export default connect(
  mapStateToProps,
  {}
)(StackSelector)
