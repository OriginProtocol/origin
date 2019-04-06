import React, { Component, Fragment } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { MARKETPLACE_DAPP_URL } from 'react-native-dotenv'

import CardsModal from 'components/cards-modal'

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.toggleModal = this.toggleModal.bind(this)
    this.state = {
      modalOpen: false
    }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Marketplace',
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      },
      headerRight: (
        <TouchableOpacity onPress={() => {
          navigation.state.params.toggleModal()
        }}>
          <Text style={{ marginRight: 10 }}>💄</Text>
        </TouchableOpacity>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleModal: this.toggleModal })
  }

  onWebViewMessage(event) {
    console.debug(event)
    console.debug(`Got event:`)

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

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    console.debug(`Loading marketplace at ${MARKETPLACE_DAPP_URL}`)

    const injectedJavaScript = `
      window.__mobileBridge = true;
      window.__mobileBridgeAccount = '1234';
      true;
    `

    return (
      <Fragment>
        <WebView
          ref={webview => {
            this.dappWebView = webview
          }}
          source={{ uri: MARKETPLACE_DAPP_URL }}
          onMessage={this.onWebViewMessage.bind(this)}
          injectedJavaScript={injectedJavaScript}
        />
        <CardsModal
          visible={this.state.modalOpen}
          onPress={this.toggleModal}
          onRequestClose={this.toggleModal}
        />
      </Fragment>
    )
  }
}

export default MarketplaceScreen
