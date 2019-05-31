'use strict'

import React from 'react'
import { connect } from 'react-redux'

import withOnboardingSteps from 'hoc/withOnboardingSteps'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  async selectStack() {
    // Navigate to WebView screen to ensure DApp is mounted so we can
    // make graphql mutations and queries via window.gql
    this.props.navigation.navigate('App')

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
