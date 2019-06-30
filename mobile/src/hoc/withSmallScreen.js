'use strict'

import React, { Component } from 'react'
import { Dimensions } from 'react-native'

function withSmallScreen(WrappedComponent) {
  class WithSmallScreen extends Component {
    render() {
      const smallScreen = height < 812
      const { height } = Dimensions.get('window')

      return <WrappedComponent {...this.props} smallScreen={smallScreen} />
    }
  }

  return WithSmallScreen
}

export default withSmallScreen
