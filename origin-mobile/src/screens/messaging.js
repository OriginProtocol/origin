import React, { Component } from 'react'
import { WebView } from 'react-native'

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
      <WebView source={{ uri: 'https://dapp.originprotocol.com/#/messages?skip-onboarding=true' }} />
    )
  }
}

export default MessagingScreen
