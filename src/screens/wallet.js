import React, { Component } from 'react'
import { Alert, Clipboard, StyleSheet, Text, View } from 'react-native'

import OriginButton from '../components/origin-button'

export default class WalletScreen extends Component {
  static navigationOptions = {
    title: 'Wallet',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  render() {
    // placeholders
    const amountETH = 0
    const amountUSD = 0
    const address = '0x12Be343B94f860124dC4fEe278FDCBD38C101FOO'
    const privateKey = '0x34Be343B94f860124dC4fEe278FDCBD38C102BAR'

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
          </View>
        </View>
      </View>
    )
  }
}

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
