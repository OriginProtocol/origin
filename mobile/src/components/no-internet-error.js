'use strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Text } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

class NoInternetError extends Component {
  state = { loading: false }

  render() {
    return (
      <>
        <Text style={[styles.errorText, this.props.errorTextStyle]}>
          <fbt desc="NoInternetError.errorText">
            An error occurred loading the Origin Marketplace. Please check your
            internet connection.
          </fbt>
        </Text>
        <OriginButton
          size="large"
          type={this.props.buttonType}
          title={fbt('Retry', 'NoInternetError.retryButton')}
          onPress={() => {
            this.setState({ loading: true })
            DeviceEventEmitter.emit('reloadMarketplace')
            // Simulate a load to prevent instant flash
            setTimeout(() => {
              this.setState({ loading: false })
            }, 5000)
          }}
          loading={this.state.loading}
        />
      </>
    )
  }
}

const styles = {
  ...CommonStyles,
  errorText: {
    width: '80%',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20
  }
}

export default NoInternetError
