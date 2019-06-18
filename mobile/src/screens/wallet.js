'use strict'

import React, { Component } from 'react'
import { Alert, Clipboard, ScrollView, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import Address from 'components/address'
import Currency from 'components/currency'

import currencies from 'utils/currencies'
import { evenlySplitAddress } from 'utils/user'

class WalletScreen extends Component {
  static navigationOptions = () => {
    return {
      title: String(fbt('Wallet', 'WalletScreen.navigationTitle')),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    }
  }

  constructor(props) {
    super(props)
  }

  handleFunding(currency) {
    const { address } = this.props.wallet.activeAccount.address

    Alert.alert(
      String(fbt('Funding', 'WalletScreen.fundingAlertTitle')),
      String(
        fbt(
          `For now, you will need to transfer ${fbt.param(
            'currency',
            currency
          )} into your Origin Wallet from another source.`,
          'WalletScreen.fundingAlertMessage'
        )
      ),
      [
        {
          text: String(
            fbt('Show Address', 'WalletScreen.fundingAlertShowAddressButton')
          ),
          onPress: () => {
            Alert.alert(
              String(
                fbt(
                  'Wallet Address',
                  'WalletScreen.fundingAlertShowAddressTitle'
                )
              ),
              evenlySplitAddress(address).join('\n')
            )
          }
        },
        {
          text: String(
            fbt('Copy Address', 'WalletScreen.fundingAlertCopyAddressButton')
          ),
          onPress: async () => {
            await Clipboard.setString(address)

            Alert.alert(
              String(
                fbt(
                  'Copied to clipboard!',
                  'WalletScreen.fundingAlertCopyAddressTitle'
                )
              ),
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
            label={fbt('Wallet Address', 'WalletScreen.addressLabel')}
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
