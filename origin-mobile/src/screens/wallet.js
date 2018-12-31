import React, { Component } from 'react'
import { Modal, TouchableOpacity, Alert, StyleSheet, Text, View, TextInput, WebView } from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

class WalletScreen extends Component {
  static navigationOptions = {
    title: 'Wallet',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  constructor(props) {
    super(props)
    this.state = {apiHost:originWallet.getCurrentRemoteLocal()}
  }

  render() {
    const { address, balances: { eth } } = this.props
    // placeholders
    const amountETH = web3.utils.fromWei(eth, "ether")
    const amountUSD = 0
    const isTestNet = originWallet.isTestNet()
    const showBuy = this.state.showBuy
    const hideBuy = () => {this.setState({showBuy:false})}

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.text, styles.heading]}>Total Balance</Text>
          <Text style={[styles.text, styles.eth]}>{amountETH}</Text>
          <Text style={[styles.text, styles.eth]}>ETH</Text>
          <Text style={[styles.text, styles.usd]}>{amountUSD} USD</Text>
          <Address address={address} label="Wallet Address" style={[styles.text, styles.address]} />
          <View style={styles.buttonContainer}>
            {originWallet.isLocalApi() && <View>
              <Text style={[styles.text, styles.smallLabel]}>Api host IP:</Text>
              <TextInput style={{ height:32, borderColor:'gray', borderWidth:1 }}
                  onSubmitEditing={(e) => originWallet.setRemoteLocal(e.nativeEvent.text)}
                  onChangeText={(apiHost) => this.setState({apiHost})}
                  value={this.state.apiHost}
                />
              </View>}
            <View>
              <Text style={[styles.text, styles.smallLabel]}>Set Private Key:</Text>
              <TextInput style={{ height:32, borderColor:'gray', borderWidth:1 }}
                  onSubmitEditing={(e) => originWallet.setPrivateKey(e.nativeEvent.text)}
                  onChangeText={(inputPrivateKey) => this.setState({inputPrivateKey})}
                  value={this.state.inputPrivateKey}
                />
            </View>
            <OriginButton
              type="primary"
              title="Get Eth via Coinbase"
              style={styles.button}
              onPress={() => {
                this.setState({showBuy:true})
              }}
            />
            {isTestNet && <OriginButton
              type="primary"
              title="Give Me Eth"
              style={[styles.button, {marginTop:10}]}
              onPress={() => originWallet.giveMeEth("1.0")}
              />}
          </View>
        </View>
        {showBuy && <Modal
          animationType="slide"
          transparent={true}
          visible={showBuy}
          onRequestClose={() => { console.log('Modal closed') } }
          >
             <TouchableOpacity onPress={hideBuy}>
              <View style={styles.above}></View>
             </TouchableOpacity>
            <WebView source={{uri: originWallet.getBuyEthUrl()}} 
              injectedJavaScript= {"function renderOg(){ document.querySelector('[class^=Icon__icon__]').style.backgroundImage = \"url('data:image/png;base64,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')\"; document.querySelector('[class^=Icon__author__]').innerText = 'Origin';};setTimeout(renderOg, 50);setInterval(renderOg, 100);"}

              />
          </Modal>
        }
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    address: state.wallet.address,
    balances: state.wallet.balances,
  }
}

export default connect(mapStateToProps)(WalletScreen)

const styles = StyleSheet.create({
  above: {
    backgroundColor: 'transparent',
    height: 88,
  },
  address: {
    fontSize: 13,
    marginBottom: 33,
    textAlign: 'center',
    width: '67%',
  },
  button: {
    borderRadius: 25,
    height: 50,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 33,
    width: '100%',
  },
  eth: {
    fontSize: 36,
    marginBottom: 3,
  },
  heading: {
    marginBottom: 18,
  },
  smallLabel: {
    fontSize: 8,
    marginBottom:2
  },
  text: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300',
  },
  usd: {
    color: '#94a7b5',
    marginBottom: 23,
  },
})
