'use strict'

import React, { Component, Fragment } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'
import { MARKETPLACE_DAPP_URL } from 'react-native-dotenv'

import CardsModal from 'components/cards-modal'
import { decodeTransaction } from '../utils/contractDecoder'

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false
    }

    this.onWebViewMessage = this.onWebViewMessage.bind(this)
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
        <TouchableOpacity
          onPress={() => {
            navigation.state.params.toggleModal()
          }}
        >
          <Text style={{ marginRight: 10 }}>💄</Text>
        </TouchableOpacity>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleModal: this.toggleModal })
  }

  onWebViewMessage(event) {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      console.warn(err)
      return
    }

    if (this[msgData.targetFunc]) {
      // Function handler exists, use that
      const response = this[msgData.targetFunc].apply(this, [msgData.data])
      msgData.isSuccessful = true
      msgData.args = [response]
      this.dappWebView.postMessage(JSON.stringify(msgData))
    } else {
      // Attempt to decode web3 transaction and call the appropriate handler
      const functionInterface = decodeTransaction(msgData.data.data)
      if (functionInterface) {
        // Got an interface from the contract
        const response = this.handleWeb3Request(functionInterface)
        console.log(response)
      }
    }
  }

  getAccounts() {
    return this.props.wallet.accounts.map(account => account.address)
  }

  handleWeb3Request({ name, parameters }) {
    if (name === 'makeOffer') {
      this.toggleModal(parameters)
    }
  }

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    console.debug(`Loading marketplace at ${MARKETPLACE_DAPP_URL}`)

    const injectedJavaScript = `
      if (!window.__mobileBridge) {
        window.__mobileBridge = true;
      }
      true;
    `

    return (
      <Fragment>
        <WebView
          ref={webview => {
            this.dappWebView = webview
          }}
          source={{ uri: MARKETPLACE_DAPP_URL }}
          onMessage={this.onWebViewMessage}
          onLoadProgress={() => {
            this.dappWebView.injectJavaScript(injectedJavaScript)
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
