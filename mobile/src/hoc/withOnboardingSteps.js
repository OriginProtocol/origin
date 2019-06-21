'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getNextOnboardingStep } from 'utils/user'

function withOnboardingSteps(WrappedComponent) {
  class WithOnboardingSteps extends Component {
    render() {
      return (
        <WrappedComponent
          {...this.props}
          nextOnboardingStep={getNextOnboardingStep(
            this.props.onboarding,
            this.props.settings
          )}
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
