import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'

import originWallet from '../OriginWallet'

class MarketplaceScreen extends Component {
  static navigationOptions = {
    title: 'Marketplace',
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
        source={{ uri: originWallet.getMarketplaceUrl() }}
        injectedJavaScript = {`window.__linkWallet && window.__linkWallet('${address}', '${originWallet.getWalletToken()}');`}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    address: state.wallet.address,
  }
}

export default connect(mapStateToProps)(MarketplaceScreen)
