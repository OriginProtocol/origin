import React, { Component } from 'react'
// To Do: switch to react-native-webview (https://github.com/react-native-community/react-native-webview)
import { WebView } from 'react-native'
import {
  MESSAGING_URL,
} from 'react-native-dotenv'

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
      <WebView source={{ uri: MESSAGING_URL }} />
    )
  }
}

export default MessagingScreen
