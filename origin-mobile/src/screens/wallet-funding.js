import React, { Component } from 'react'
import { Alert, Clipboard, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications } from 'actions/Activation'

import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { evenlySplitAddress, truncateAddress } from 'utils/user'

import originWallet from '../OriginWallet'

class WalletFundingScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.currency.toUpperCase()} Balance`,
    headerTitleStyle : {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  })

  componentDidMount() {
    const { method } = this.props.navigation.state.params.item.meta
    
    this.props.promptForNotifications(method)
  }

  render() {
    const { address, balances, navigation } = this.props
    const { currency, item } = navigation.state.params
    const balance = web3.utils.fromWei(balances[currency], 'ether')
    const hasSufficientFunds = web3.utils.toBN(balances[currency]).gt(item.cost)

    return (
      <View style={styles.container}>
        <View style={styles.currency}>
          <Text style={{ ...styles.heading, color: currencies[currency].color }}>
            {currency.toUpperCase()}
          </Text>
          <Image source={currencies[currency].icon} style={styles.icon} />
          <Text style={styles.balance}>{Number(balance).toFixed(5)}</Text>
          <Text style={styles.address}>{truncateAddress(address)}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentHeading}>Add Funds</Text>
          <Text style={styles.contentBody}>
            {`You don't have enough ${currencies[currency].name} in your wallet to complete this transaction. Please transfer ${currency.toUpperCase()} into your wallet.`}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Copy Wallet Address'}
            onPress={async () => {
              await Clipboard.setString(address)

              Alert.alert('Copied to clipboard!', evenlySplitAddress(address).join('\n'))
            }}
          />
          <OriginButton
            disabled={!hasSufficientFunds}
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Done'}
            onDisabledPress={() => {
              Alert.alert('You must add funds to continue.')
            }}
            onPress={() => {
              Alert.alert('To Do: navigate to the confirm/cancel screen')
            }}
          />
        </View>
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

const mapDispatchToProps = dispatch => ({
  promptForNotifications: perspective => dispatch(promptForNotifications(perspective)),
})

export default connect(mapStateToProps, mapDispatchToProps)(WalletFundingScreen)

const styles = StyleSheet.create({
  address: {
    color: '#6a8296',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
  },
  balance: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '300',
  },
  button: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flex: 0,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingVertical: '5%',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  contentBody: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
  },
  contentHeading: {
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 10,
  },
  currency: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  icon: {
    marginBottom: 15,
  },
})
