import React, { Component } from 'react'
import { View } from 'react-native'
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
    
  render() {
    return (
      <View style={{ flex: 1 }}>
        <QRCodeScanner
          reactivate={true}
          reactivateTimeout={5000}
          onRead={originWallet.onQRScanned}
          showMarker={true}
          customMarker={<ScanMarker />}
          cameraProps={{ captureAudio: false }}
          cameraStyle={{ height: '100%' }}
        />
      </View>
    )
  }
}
