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
    // Display headers if there are more than one mnemonic, this covers the
    // case of private key accounts because mnemonic will be undefined
    const uniqueMnemonics = [...new Set(wallet.accounts.map(a => a.mnemonic))]

    if (uniqueMnemonics.length > 1) {
      let recoveryPhraseNumber = 1
      return uniqueMnemonics.map((mnemonic, i) => {
        const listHeaderComponent = (
          <View style={styles.listHeaderContainer}>
            <Text style={styles.listHeader}>
              {(mnemonic &&
                `${fbt(
                  'Recovery Phrase',
                  'AccountScreen.recoveryPhraseListHeader'
                )} ${recoveryPhraseNumber}`) ||
                fbt(
                  'Imported from Private Key',
                  'AccountScreen.privateKeyListHeader'
                )}
            </Text>
          </View>
        )

        if (mnemonic) {
          recoveryPhraseNumber += 1
        }

        return this.renderAccountList(
          wallet.accounts.filter(a => a.mnemonic === mnemonic),
          listHeaderComponent,
          i
        )
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
