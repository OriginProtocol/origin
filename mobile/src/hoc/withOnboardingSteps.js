'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

function withOnboardingSteps(WrappedComponent) {
  class WithOnboardingSteps extends Component {
    nextOnboardingStep() {
      if (!this.props.settings.email) {
        return 'Email'
      } else if (
        !this.props.settings.firstName ||
        !this.props.settings.lastName
      ) {
        return 'Name'
      } else if (!this.props.settings.profileImage) {
        return 'ProfileImage'
      } else if (
        !this.props.settings.pin &&
        !this.props.settings.biometryType
      ) {
        return 'Authentication'
      }
      return 'Ready'
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          nextOnboardingStep={this.nextOnboardingStep()}
        />
      )
    }
  }

  const mapStateToProps = ({ settings }) => {
    return { settings }
  }

  return connect(
    mapStateToProps,
    {}
  )(WithOnboardingSteps)
}

export default withOnboardingSteps
