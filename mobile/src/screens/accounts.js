'use strict'

import React, { Component } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import AccountItem from 'components/account-item'
import ListStyles from 'styles/list'

const IMAGES_PATH = '../../assets/images/'

class AccountsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: String(fbt('Accounts', 'AccountsScreen.headerTitle')),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      },
      headerRight: (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ImportAccount')
          }}
        >
          <Image
            source={require(`${IMAGES_PATH}add.png`)}
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
      )
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <ScrollView style={styles.listContainer}>{this.renderLists()}</ScrollView>
    )
  }

  renderLists() {
    const { wallet } = this.props
    const uniqueMnemonics = [
      ...new Set(wallet.accounts.filter(a => a.mnemonic).map(a => a.mnemonic))
    ]

    const accountsByHeader = {}
    wallet.accounts.forEach(account => {
      let header
      if (account.mnemonic) {
        header = `${fbt(
          'Recovery Phrase',
          'AccountScreen.recoveryPhraseListHeader'
        )} ${uniqueMnemonics.indexOf(account.mnemonic) + 1}`
      } else if (account.privateKey) {
        header = fbt(
          'Imported from Private Key',
          'AccountScreen.privateKeyListHeader'
        )
      } else {
        header = fbt(`Samsung Blockchain Keystore`, 'AccountScreen.samsungBKS')
      }

      if (accountsByHeader[header]) {
        accountsByHeader[header].push(account)
      } else {
        accountsByHeader[header] = [account]
      }
    })

    // Render headers if more than 1 type of account
    const renderHeaders = Object.keys(accountsByHeader).length > 1

    if (renderHeaders) {
      return Object.entries(accountsByHeader).map(entry => {
        const listHeaderComponent = (
          <View style={styles.listHeaderContainer}>
            <Text style={styles.listHeader}>{entry[0]}</Text>
          </View>
        )
        return this.renderAccountList(entry[1], listHeaderComponent, entry[0])
      })
    } else {
      return this.renderAccountList(wallet.accounts, <></>)
    }
  }

  renderAccountList(accounts, listHeaderComponent, key) {
    const { navigation } = this.props
    return (
      <FlatList
        data={accounts}
        renderItem={({ item }) => (
          <AccountItem item={item} navigation={navigation} />
        )}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={() => listHeaderComponent}
        keyExtractor={item => item.address}
        key={key ? key : 0}
        style={styles.list}
      />
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(AccountsScreen)

const styles = StyleSheet.create({
  ...ListStyles
})
