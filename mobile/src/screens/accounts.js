'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import AccountItem from 'components/account-item'
import AccountModal from 'components/account-modal'

const IMAGES_PATH = '../../assets/images/'

class AccountsScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false
    }

    this.toggleModal = this.toggleModal.bind(this)
  }

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
            navigation.state.params.toggleModal()
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

  componentDidMount() {
    this.props.navigation.setParams({ toggleModal: this.toggleModal })
  }

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    const { navigation, wallet } = this.props

    return (
      <>
        <FlatList
          data={wallet.accounts.sort((a, b) => a.address > b.address)}
          renderItem={({ item }) => (
            <AccountItem
              item={item}
              wallet={wallet}
              navigation={navigation}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
        />
        <AccountModal
          visible={this.state.modalOpen}
          onPress={this.toggleModal}
          onRequestClose={this.toggleModal}
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
