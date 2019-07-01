'use strict'

import React, { Component } from 'react'
import { Alert, Clipboard, ScrollView, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { evenlySplitAddress } from 'utils/user'
import Address from 'components/address'
import Currency from 'components/currency'
import currencies from 'utils/currencies'
import ListStyles from 'styles/list'

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
    const { address } = this.props.wallet.activeAccount

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
        <View style={styles.listHeaderContainer}>
          <Address
            address={wallet.activeAccount.address}
            label={fbt('Wallet Address', 'WalletScreen.addressLabel')}
            styles={{ textAlign: 'center' }}
          />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
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
  ...ListStyles
})
