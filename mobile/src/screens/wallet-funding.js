import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'

import {
  promptForNotifications,
  updateBackupWarningStatus
} from 'actions/Activation'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { sufficientFunds } from 'utils/transaction'
import { evenlySplitAddress } from 'utils/user'

import originWallet from '../OriginWallet'

class WalletFundingScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.getParam('currency').toUpperCase()} Balance`,
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  })

  componentDidMount() {
    const { activation, navigation } = this.props
    const hasNotificationsEnabled =
      activation.notifications.permissions.hard.alert
    const { method } = navigation.state.params.item.meta

    !hasNotificationsEnabled && this.props.promptForNotifications(method)

    // prompt with private key backup warning if before recommending funding
    if (!activation.backupWarningDismissed) {
      Alert.alert(
        'Important!',
        `Be sure to back up your private key so that you don't lose access to your wallet. If your device is lost or you delete this app, we won't be able to help recover your funds.`,
        [
          {
            text: `Done. Don't show me this again.`,
            onPress: () => {
              this.props.updateBackupWarningStatus(true, Date.now())
            }
          },
          {
            text: 'Show Private Key',
            onPress: () => {
              originWallet.showPrivateKey()

              this.props.updateBackupWarningStatus(true)
            }
          }
        ]
      )
    }
  }

  render() {
    const { navigation, wallet } = this.props
    const { address, balances } = wallet
    const { currency, item } = navigation.state.params
    const balance = web3.utils.fromWei(balances[currency], 'ether')
    const fundsRequired = web3.utils
      .toBN(item.cost)
      .add(web3.utils.toBN(item.gas_cost))
    const readableRequired = web3.utils.fromWei(fundsRequired.toString())
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <View style={styles.container}>
        <View style={styles.currency}>
          <Text
            style={{ ...styles.heading, color: currencies[currency].color }}
          >
            {currency.toUpperCase()}
          </Text>
          <Image
            source={currencies[currency].icon}
            style={
              smallScreen
                ? { ...styles.icon, height: 30, width: 30 }
                : styles.icon
            }
          />
          <Text style={styles.balance}>{Number(balance).toFixed(5)}</Text>
          <Address
            address={address}
            label="Wallet Address"
            style={styles.address}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.contentHeading}>Add Funds</Text>
          <Text
            style={{ ...styles.contentBody, fontSize: smallScreen ? 14 : 18 }}
          >
            {`You don't have enough ${
              currencies[currency].name
            } in your wallet to complete this transaction. Please transfer at least ${Number(
              readableRequired
            ).toFixed(5)} ${currency.toUpperCase()} into your wallet.`}
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

              Alert.alert(
                'Copied to clipboard!',
                evenlySplitAddress(address).join('\n')
              )
            }}
          />
          <OriginButton
            disabled={!sufficientFunds(wallet, item)}
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Done'}
            onDisabledPress={() => {
              Alert.alert('You must add funds to continue.')
            }}
            onPress={() => {
              navigation.navigate('Transaction', { item })
            }}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
  promptForNotifications: method => dispatch(promptForNotifications(method)),
  updateBackupWarningStatus: (bool, datetime) =>
    dispatch(updateBackupWarningStatus(bool, datetime))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletFundingScreen)

const styles = StyleSheet.create({
  address: {
    color: '#6a8296',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300'
  },
  balance: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '300'
  },
  button: {
    marginBottom: 10
  },
  buttonsContainer: {
    flex: 0,
    width: '100%'
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingVertical: '5%'
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  contentBody: {
    fontFamily: 'Lato',
    fontWeight: '300',
    textAlign: 'center'
  },
  contentHeading: {
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 10
  },
  currency: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  icon: {
    marginBottom: 15
  }
})
