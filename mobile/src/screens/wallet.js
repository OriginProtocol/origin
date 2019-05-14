'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import Currency from 'components/currency'
import BackupCard from 'components/backup-card'

import currencies from 'utils/currencies'
import { evenlySplitAddress } from 'utils/user'

class WalletScreen extends Component {
  static navigationOptions = {
    title: 'Wallet',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      displayBackupModal: true
    }
  }

  componentDidMount() {
    const { activation, wallet } = this.props
    const hasBalance =
      Object.keys(wallet.accountBalance).find((currency, balance) => {
        return balance > 0
      }) !== undefined

    // Prompt that backup is required if balance was detected
    if (hasBalance && !activation.backupWarningDismissed) {
      this.setState({ displayBackupModal: true })
    }
  }

  handleFunding(currency) {
    const { address } = this.props.wallet.activeAccount

    Alert.alert(
      'Funding',
      `For now, you will need to transfer ${currency} into your Orign Wallet from another source.`,
      [
        {
          text: 'Show Address',
          onPress: () => {
            Alert.alert(
              'Wallet Address',
              evenlySplitAddress(address).join('\n')
            )
          }
        },
        {
          text: 'Copy Address',
          onPress: async () => {
            await Clipboard.setString(address)

            Alert.alert(
              'Copied to clipboard!',
              evenlySplitAddress(address).join('\n')
            )
          }
        }
      ]
    )
  }

  render() {
    const { wallet } = this.props

    return (
      <>
        <View style={styles.addressContainer}>
          <Address
            address={wallet.activeAccount.address}
            label={'Wallet Address'}
            style={styles.address}
          />
        </View>
        <ScrollView
          style={styles.svContainer}
          contentContainerStyle={styles.walletSVContainer}
        >
          <Currency
            abbreviation={'ETH'}
            balance={wallet.accountBalance.eth}
            labelColor={currencies['eth'].color}
            name={currencies['eth'].name}
            imageSource={currencies['eth'].icon}
            onPress={() => this.handleFunding('ETH')}
          />
          <Currency
            abbreviation={'DAI'}
            balance={wallet.accountBalance.dai || 0}
            labelColor={currencies['dai'].color}
            name={currencies['dai'].name}
            imageSource={currencies['dai'].icon}
            precision={2}
            onPress={() => this.handleFunding('DAI')}
          />
          <Currency
            abbreviation={'OGN'}
            balance={wallet.accountBalance.ogn || 0}
            labelColor={currencies['ogn'].color}
            name={currencies['ogn'].name}
            imageSource={currencies['ogn'].icon}
            precision={0}
            onPress={() => this.handleFunding('OGN')}
          />
        </ScrollView>
        {this.state.displayBackupModal && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            onRequestClose={() => {
              this.setState({ displayBackupModal: false })
            }}
          >
            <SafeAreaView style={styles.svContainer}>
              <BackupCard
                wallet={this.props.wallet}
                navigation={this.props.navigation}
                onRequestClose={() => {
                  this.setState({ displayBackupModal: false })
                }}
              />
            </SafeAreaView>
          </Modal>
        )}
      </>
    )
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

export default connect(mapStateToProps)(WalletScreen)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  svContainer: {
    flex: 1
  },
  walletSVContainer: {
    paddingHorizontal: 10
  },
  address: {
    color: '#6a8296',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center'
  },
  addressContainer: {
    paddingHorizontal: 18 * 3,
    paddingVertical: 22
  }
})
