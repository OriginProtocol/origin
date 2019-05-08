'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this.selectStack()
  }

  selectStack(versions) {
    if (this.props.wallet.accounts.length == 0) {
      this.props.navigation.navigate('Welcome')
    } else if (!this.props.settings.email) {
      this.props.navigation.navigate('Email')
    } else if (!this.props.settings.pin && !this.props.settings.biometryType) {
      this.props.navigation.navigate('Authentication')
    } else {
      this.props.navigation.navigate('App')
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
