import React, { Component } from 'react'
import { WebView } from 'react-native-webview'

import originWallet from '../OriginWallet'

class MessagingScreen extends Component {
  static navigationOptions = {
    title: 'Messaging',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  render() {
    return (
      <WebView
        source={{ uri: originWallet.getMessagingUrl() }}
        injectedJavaScript = {`window.__linkToWalletContainer && window.__linkToWalletContainer('${originWallet.getWalletToken()};')`}
      />
    )
  }
}

export default MessagingScreen
