import React, { Component } from 'react'
import { Alert, Clipboard, StyleSheet, Text, View, TextInput } from 'react-native'
import { connect } from 'react-redux'

import originWallet from '../OriginWallet'
import OriginButton from '../components/origin-button'

class WalletScreen extends Component {
  static navigationOptions = {
    title: 'Wallet',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  render() {
    const { address, balance } = this.props
    // placeholders
    const amountETH = web3.utils.fromWei(balance, "ether")
    const amountUSD = 0
    // really dangerous function
    const privateKey = address ? web3.eth.accounts.wallet[0].privateKey : ""
    const isTestNet = originWallet.isTestNet()

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.text, styles.heading]}>Total Balance</Text>
          <Text style={[styles.text, styles.eth]}>{amountETH}</Text>
          <Text style={[styles.text, styles.eth]}>ETH</Text>
          <Text style={[styles.text, styles.usd]}>{amountUSD} USD</Text>
          <Text style={[styles.text, styles.address]}>{address}</Text>
          <View style={styles.buttonContainer}>
            <OriginButton
              type="primary"
              title="Show Private Key"
              style={[styles.button, { marginBottom: 10 }]}
              onPress={() => Alert.alert('Private Key', privateKey)}
            />
            <OriginButton
              type="primary"
              title="Copy Private Key"
              style={styles.button}
              onPress={async () => {
                await Clipboard.setString(privateKey)
                Alert.alert('Copied to clipboard!')
              }}
            />
            {isTestNet && <OriginButton
              type="primary"
              title="Give Me Eth"
              style={[styles.button, {marginTop:10}]}
              onPress={() => originWallet.giveMeEth("1.0")}
              />}
            {originWallet.isLocalApi() && <View>
              <Text style={[styles.text, styles.heading]}>Api host IP:</Text>
              <TextInput style={{ height:40, borderColor:'gray', borderWidth:1 }}
                  onSubmitEditing={(e) => originWallet.setRemoteLocal(e.nativeEvent.text)}
                  value={originWallet.getCurrentRemoteLocal()}
                />
              </View>}
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    address: state.wallet.address,
  }
}

export default connect(mapStateToProps)(WalletScreen)

const styles = StyleSheet.create({
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
