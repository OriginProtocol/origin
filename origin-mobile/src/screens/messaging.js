import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'

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
    const { address } = this.props
    return (
      <WebView
        source={{ uri: originWallet.getMessagingUrl() }}
        injectedJavaScript = {`window.__setWalletMessaging && window.__setWalletMessaging('${address}', ${JSON.stringify(originWallet.getMessagingKeys())});`}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    address: state.wallet.address,
  }
}

export default connect(mapStateToProps)(MessagingScreen)
