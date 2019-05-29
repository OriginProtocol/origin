'use strict'

import React from 'react'
import { connect } from 'react-redux'

import withOnboardingSteps from 'hoc/withOnboardingSteps'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  selectStack() {
    if (
      this.props.nextOnboardingStep &&
      this.props.nextOnboardingStep !== 'Ready'
    ) {
      this.props.navigation.navigate('Welcome')
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

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    {}
  )(StackSelector)
)
