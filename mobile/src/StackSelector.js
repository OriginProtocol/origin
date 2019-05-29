'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  selectStack() {
    let onboardingStep
    if (!this.props.settings.pin && !this.props.settings.biometryType) {
      onboardingStep = 'Authentication'
    } else if (!this.props.settings.email) {
      onboardingStep = 'Email'
    } else if (
      !this.props.settings.firstName ||
      !this.props.settings.lastName
    ) {
      onboardingStep = 'Name'
    } else if (!this.props.settings.profileImage) {
      onboardingStep = 'ProfileImage'
    }

    if (onboardingStep) {
      this.props.navigation.navigate('Welcome', { onboardingStep })
    } else {
      this.props.navigation.navigate('GuardedApp')
    }
  }

  render() {
    return <></>
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

export default connect(
  mapStateToProps,
  {}
)(StackSelector)
