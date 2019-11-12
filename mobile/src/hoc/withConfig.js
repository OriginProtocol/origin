'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

import Configs from '@origin/graphql/src/configs'

function withConfig(WrappedComponent) {
  class WithConfig extends Component {
    render() {
      return (
        <WrappedComponent
          {...this.props}
          config={Configs[this.props.settings.network.name.toLowerCase()]}
          configs={Configs}
        />
      )
    }
  }

  const mapStateToProps = ({ settings }) => {
    return { settings }
  }

  return connect(mapStateToProps, {})(WithConfig)
}

export default withConfig
