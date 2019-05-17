'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  selectStack() {
    const displayOnboarding = !this.props.settings.pin && !this.props.settings.biometryType
    if (displayOnboarding) {
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

export default connect(
  mapStateToProps,
  {}
)(StackSelector)
