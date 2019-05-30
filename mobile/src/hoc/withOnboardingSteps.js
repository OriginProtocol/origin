'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

function withOnboardingSteps(WrappedComponent) {
  class WithOnboardingSteps extends Component {
    static onboardingSteps = [
      'Welcome',
      'Email',
      'Phone',
      'Name',
      'ProfileImage',
      'Authentication',
      'Ready'
    ]

    /*
    prevOnboardingStep(currentStep) {
      const i = onboardingSteps.indexOf(currentStep)
      return onboardingSteps[i - 1]
    }
    */

    nextOnboardingStep() {
      if (!this.props.onboarding.emailAttestation) {
        return 'Email'
      } else if (!this.props.onboarding.phoneAttestation) {
        return 'Phone'
      } else if (
        !this.props.onboarding.firstName ||
        !this.props.onboarding.lastName
      ) {
        return 'Name'
      } else if (!this.props.onboarding.profileImage) {
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
          // prevOnboardingStep={this.prevOnboardingStep}
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
