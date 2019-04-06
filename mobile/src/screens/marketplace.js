'use strict'

import React, { Component, Fragment } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'

import { MARKETPLACE_DAPP_URL } from 'react-native-dotenv'

import CardsModal from 'components/cards-modal'

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false,
      injected: false
    }

    this.toggleModal = this.toggleModal.bind(this)
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
    alert('Hello from react-native')
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
      window.__mobileBridgeAccount = '${this.props.wallet.address}';
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
          onLoadStart={e => {
            this.setState({ injected: false })
            console.log('Injected false')
          }}
          onLoadProgress={e => {
            console.log('Load progress')
            if (!this.state.injected) {
              console.log('Injecting javascript')
              this.dappWebView.injectJavaScript(injectedJavaScript)
              this.setState({ injected: true })
            }
          }}
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

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(MarketplaceScreen)
