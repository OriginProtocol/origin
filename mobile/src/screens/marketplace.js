import React, { Component } from 'react'
import { WebView } from 'react-native-webview'

import { MARKETPLACE_DAPP_URL } from 'react-native-dotenv'

class MarketplaceScreen extends Component {
  static navigationOptions = {
    title: 'Marketplace',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }

  onWebViewMessage(event) {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      console.warn(err)
      return
    }

    let response
    if (this[msgData.targetFunc]) {
      response = this[msgData.targetFunc].apply(this, [msgData.data])
    }
  }

  handleMakeOffer({ listingID, value, from, quantity }) {
    alert('Please confirm purchase of: ' + listingID)
  }

  render() {
    return (
      <WebView
        ref={webview => {
          this.dappWebView = webview
        }}
        source={{ uri: MARKETPLACE_DAPP_URL }}
        onMessage={this.onWebViewMessage.bind(this)}
      />
    )
  }
}

export default MarketplaceScreen
