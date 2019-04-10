'use strict'

import React, { Component, Fragment } from 'react'
import { Modal, StyleSheet, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'
import { MARKETPLACE_DAPP_URL } from 'react-native-dotenv'

import CardsModal from 'components/cards-modal'
import { decodeTransaction } from '../utils/contractDecoder'
import TransactionCard from 'components/transaction-card'

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
      msgData.isSuccessful = true
      msgData.args = [response]
      this.dappWebView.postMessage(JSON.stringify(msgData))
    } else {
      // Attempt to decode web3 transaction and call the appropriate handler
      const functionInterface = decodeTransaction(msgData.data.data)
      if (functionInterface) {
        // Got an interface from the contract
        this.handleWeb3Request(msgData, functionInterface)
      }
    }
  }

  getAccounts() {
    return this.props.wallet.accounts.map(account => account.address)
  }

  handleWeb3Request(msgData, { name, parameters }) {
    if (name === 'makeOffer') {
      this.setState(prevState => ({
        modals: [
          ...prevState.modals,
          {
            type: 'transaction',
            method: name,
            props: parameters,
            msgData: msgData
          }
        ]
      }))
    }
  }

  toggleModal(modal) {
    this.setState(prevState => {
      modals: prevState.modals.filter(x => x === modal)
    })
    // Call the appropriate callback
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
          source={{ uri: MARKETPLACE_DAPP_URL }}
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
                onPress={() => this.toggleModal(modal)}
              />
            )
          }

          return (
            <Modal
              animationType="fade"
              transparent={true}
              visible={true}
              onRequestClose={() => {
                this.toggalModal(modal)
              }}
            >
              <SafeAreaView style={styles.container}>
                <View style={styles.transparent} onPress={() => {this.toggleModal(modal) }}>
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
