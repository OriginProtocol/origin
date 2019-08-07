'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'

function withOnboardingSteps(WrappedComponent) {
  class WithOnboardingSteps extends Component {
    /* Get a list of attestations the user no longer has to complete in the
     * onboarding process by parsing the attestations from the identity and
     * any skipped attestations.
     */
    _getCompletedAttestations = () => {
      const attestationTypes = ['email', 'phone']

      const existingAttestations = []
      // Parse attestation types loaded from the identity
      get(this.props.onboarding, 'attestations', []).forEach(a => {
        try {
          const attestation = get(JSON.parse(a), 'data.attestation')
          attestationTypes.forEach(attestationType => {
            if (get(attestation, `${attestationType}.verified`)) {
              existingAttestations.push(attestationType)
            }
          })
        } catch (error) {
          console.warn('Could not parse attestation')
        }
      })

      // Concat with skipped attestations filtering for unique
      const completedAttestations = existingAttestations.concat(
        get(this.props.onboarding, 'skippedAttestations', []).filter(
          a => existingAttestations.indexOf(a) < 0
        )
      )

      return completedAttestations
    }
    //
    // Determine the outstanding onboarding steps
    _onboardingSteps = () => {
      const steps = []
      const completedAttestations = this._getCompletedAttestations()

      if (!completedAttestations.includes('email')) {
        steps.push('Email')
      }
      if (!completedAttestations.includes('phone')) {
        steps.push('Phone')
      }
      if (!this.props.onboarding.firstName || !this.props.onboarding.lastName) {
        steps.push('Name')
      }
      if (this.props.onboarding.avatarUri === null) {
        steps.push('Avatar')
      }
      if (
        this.props.onboarding.growth === null &&
        !this.props.onboarding.noRewardsDismissed
      ) {
        steps.push('Growth')
      }
      if (!this.props.settings.pin && !this.props.settings.biometryType) {
        steps.push('Authentication')
      }
      steps.push('Ready')
      return steps
    }

    nextOnboardingStep = () => {
      const onboardingSteps = this._onboardingSteps()
      console.debug('Onboarding steps:', onboardingSteps)
      const indexOfRoute = onboardingSteps.indexOf(
        this.props.navigation.state.routeName
      )
      if (indexOfRoute !== -1 && onboardingSteps.length > indexOfRoute) {
        return onboardingSteps[indexOfRoute + 1]
      } else {
        return onboardingSteps[0]
      }
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
