'use strict'

import React from 'react'
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'

import { evenlySplitAddress } from 'utils'
import Address from 'components/address'
import Currency from 'components/currency'
import currencies from 'utils/currencies'
import ListStyles from 'styles/list'
import OriginButton from 'components/origin-button'

const walletScreen = props => {
  const handleFunding = currency => {
    const { address } = props.wallet.activeAccount

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

  const renderBalances = balances => {
    return (
      <>
        <View style={styles.listHeaderContainer}>
          <Address
            address={props.wallet.activeAccount.address}
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
            balance={balances.eth}
            labelColor={currencies['eth'].color}
            name={currencies['eth'].name}
            imageSource={currencies['eth'].icon}
            onPress={() => handleFunding('ETH')}
          />
          <Currency
            abbreviation={'DAI'}
            balance={balances.dai || 0}
            labelColor={currencies['dai'].color}
            name={currencies['dai'].name}
            imageSource={currencies['dai'].icon}
            precision={2}
            onPress={() => handleFunding('DAI')}
          />
          <Currency
            abbreviation={'OGN'}
            balance={balances.ogn || 0}
            labelColor={currencies['ogn'].color}
            name={currencies['ogn'].name}
            imageSource={currencies['ogn'].icon}
            precision={0}
            onPress={() => handleFunding('OGN')}
          />
        </ScrollView>
      </>
    )
  }

  const renderLoading = () => {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    )
  }

  const renderNoActiveAddress = () => {
    return (
      <>
        <Text
          style={{ ...styles.listHeader, fontSize: 16, marginVertical: 50 }}
        >
          No account found.
        </Text>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Add Account', 'WalletScreen.addAccountButton')}
          onPress={() => {
            this.props.navigation.navigate('ImportAccount')
          }}
        />
      </>
    )
  }

  const activeAddress = get(props.wallet, 'activeAccount.address')
  const networkName = get(props.settings.network, 'name', null)
  const balances = get(
    props.wallet.accountBalance,
    `${networkName}.${activeAddress}`,
    null
  )

  if (!activeAddress) {
    return renderNoActiveAddress()
  } else if (!balances) {
    return renderLoading()
  } else {
    return renderBalances(balances)
  }
}

walletScreen.navigationOptions = () => {
  return {
    title: String(fbt('Wallet', 'WalletScreen.navigationTitle')),
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

export default connect(mapStateToProps)(walletScreen)

const styles = StyleSheet.create({
  ...ListStyles,
  loading: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white'
  }
})
