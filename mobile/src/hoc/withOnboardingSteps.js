'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

function withOnboardingSteps(WrappedComponent) {
  class WithOnboardingSteps extends Component {
    nextOnboardingStep() {
      if (
        !this.props.onboarding.emailAttestation &&
        !this.props.onboarding.emailVerified
      ) {
        return 'Email'
      } else if (
        !this.props.onboarding.phoneAttestation &&
        !this.props.onboarding.phoneVerified
      ) {
        return 'Phone'
      } else if (
        !this.props.onboarding.firstName ||
        !this.props.onboarding.lastName
      ) {
        return 'Name'
      } else if (!this.props.onboarding.avatarUri) {
        return 'Avatar'
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

  const mapStateToProps = ({ onboarding, settings }) => {
    return { onboarding, settings }
  }

  return connect(
    mapStateToProps,
    {}
  )(WithOnboardingSteps)
}

export default withOnboardingSteps
