'use strict'

import React from 'react'
import { connect } from 'react-redux'

class StackSelector extends React.Component {
  constructor(props) {
    super(props)
    this._selectStack()
  }

  _selectStack() {
    if (!this.props.activation.carouselCompleted) {
      this.props.navigation.navigate('Welcome')
    } else if (!this.props.wallet.accounts.length) {
      this.props.navigation.navigate('Onboarding')
    } else {
      this.props.navigation.navigate('App')
    }
  }

  render() {
    return <></>
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

export default connect(
  mapStateToProps,
  {}
)(StackSelector)
