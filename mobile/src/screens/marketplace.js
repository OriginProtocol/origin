'use strict'

import React, { Component, Fragment } from 'react'
import {
  Modal,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'
import { MARKETPLACE_DAPP_URL, NETWORK } from 'react-native-dotenv'

import CardsModal from 'components/cards-modal'
import { decodeTransaction } from '../utils/contractDecoder'
import TransactionCard from 'components/transaction-card'

let marketplaceDappUrl = MARKETPLACE_DAPP_URL
if (NETWORK !== 'localhost') {
  marketplaceDappUrl = `${marketplaceDappUrl}${NETWORK}`
}

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modals: []
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
      }
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
      this.handleBridgeResponse(msgData, response)
    } else {
      // Attempt to decode the Ethereum transaction and add the appropriate
      // modal to the stack
      const functionInterface = decodeTransaction(msgData.data.data)
      if (functionInterface) {
        // Got an interface from the contract
        this.handleBridgeRequest(msgData, functionInterface)
      }
    }
  }

  getAccounts() {
    return this.props.wallet.accounts.map(account => account.address)
  }

  /* Add a modal to the stack passing the message data from the webview bridge.
   */
  handleBridgeRequest(msgData, { name, parameters }) {
    if (name === 'makeOffer') {
      this.setState(prevState => ({
        modals: [
          ...prevState.modals,
          {
            type: 'transaction',
            method: name,
            callParameters: parameters,
            msgData: msgData
          }
        ]
      }))
    }
  }

  handleBridgeResponse(msgData, result) {
    msgData.isSuccessful = Boolean(result)
    msgData.args = [result]
    this.dappWebView.postMessage(JSON.stringify(msgData))
  }

  toggleModal(modal, result) {
    this.setState(prevState => {
      return {
        ...prevState,
        modals: [...prevState.modals.filter(m => m.msgData.msgId !== modal.msgData.msgId)]
      }
    })
    // Send the response to the webview
    this.handleBridgeResponse(modal.msgData, result)
  }

  render() {
    const injectedJavaScript = `
      if (!window.__mobileBridge) {
        window.__mobileBridge = true;
      }
      true;
    `

    const { modals } = this.state

    return (
      <Fragment>
        <WebView
          ref={webview => {
            this.dappWebView = webview
          }}
          source={{ uri: marketplaceDappUrl }}
          onMessage={this.onWebViewMessage}
          onLoadProgress={() => {
            this.dappWebView.injectJavaScript(injectedJavaScript)
          }}
        />
        {modals.map((modal, index) => {
          let card
          if (modal.type === 'transaction') {
            card = (
              <TransactionCard
                transactionType={modal.method}
                callParameters={modal.callParameters}
                onPress={() => this.toggleModal(modal)}
                onRequestClose={() => this.toggleModal(modal, { data: 'denied transaction signature'})}
              />
            )
          }

          return (
            <Modal
              key={modal.msgData.msgId}
              animationType="fade"
              transparent={true}
              visible={true}
              onRequestClose={() => {
                this.toggalModal(modal)
              }}
            >
              <SafeAreaView style={styles.container}>
                <View
                  style={styles.transparent}
                  onPress={() => {
                    this.toggleModal(modal)
                  }}
                >
                  {card}
                </View>
              </SafeAreaView>
            </Modal>
          )
        })}
      </Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B18234C',
    flex: 1
  },
  transparent: {
    flex: 1
  }
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(MarketplaceScreen)
