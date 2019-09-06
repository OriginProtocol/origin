'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import get from 'lodash.get'

function withIsSamsungBKS(WrappedComponent) {
  class WithIsSamsungBKS extends Component {
    render() {
      const { ref, ...rest } = this.props
      return (
        <WrappedComponent
          forwardedRef={ref}
          isSamsungBKS={get(this.props, 'samsungBKS.seedHash', '').length > 0}
          {...rest}
        />
      )
    }
  }

  const mapStateToProps = ({ samsungBKS }) => {
    return { samsungBKS }
  }

  return connect(mapStateToProps)(WithIsSamsungBKS)
}

export default withIsSamsungBKS
