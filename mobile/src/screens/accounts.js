'use strict'

import React, { Component } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import AccountItem from 'components/account-item'

const IMAGES_PATH = '../../assets/images/'

class AccountsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Accounts',
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
    const { navigation, wallet } = this.props

    return (
      <>
        <FlatList
          data={wallet.accounts.sort((a, b) => a.address > b.address)}
          renderItem={({ item }) => (
            <AccountItem item={item} wallet={wallet} navigation={navigation} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
          keyExtractor={item => item.address}
        />
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  list: {
    backgroundColor: '#f7f8f8',
    height: '100%'
  },
  separator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%'
  }
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(AccountsScreen)
