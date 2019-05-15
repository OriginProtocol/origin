'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  selectStack() {
    if (this.props.wallet.accounts.length == 0) {
      this.props.navigation.navigate('Welcome')
    } else if (!this.props.settings.pin && !this.props.settings.biometryType) {
      this.props.navigation.navigate('Authentication')
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
