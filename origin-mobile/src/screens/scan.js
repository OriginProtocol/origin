import React, { Component } from 'react'
import { View } from 'react-native'
import { NavigationEvents } from 'react-navigation';
import QRCodeScanner from 'react-native-qrcode-scanner'

import ScanMarker from 'components/scan-marker'

import originWallet from '../OriginWallet'

export default class ScanScreen extends Component {
  static navigationOptions = {
    title: 'Scan',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  constructor(props) {
    super(props)

    this.state = {
      isFocused: false
    }
  }
    
  render() {
    const { isFocused } = this.state

    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents
          onDidFocus={payload => this.setState({ isFocused: true })}
          onDidBlur={payload => this.setState({ isFocused: false })}
        />
        {isFocused && (
          <QRCodeScanner
            reactivate={true}
            reactivateTimeout={5000}
            ref={node => this.scanner = node}
            onRead={originWallet.onQRScanned}
            showMarker={true}
            customMarker={<ScanMarker />}
            cameraProps={{ captureAudio: false }}
            cameraStyle={{ height: '100%' }}
          />
        )}
      </View>
    )
  }
}
