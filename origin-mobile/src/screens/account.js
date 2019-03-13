import React, { Component } from 'react'
import { Alert, Clipboard, FlatList, Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'
import Separator from 'components/separator'

import { truncateAddress } from 'utils/user'

import originWallet from '../OriginWallet'

const ONE_MINUTE = 1000 * 60

class AccountScreen extends Component {
  constructor(props) {
    super(props)

    this.handleActivate = this.handleActivate.bind(this)
    this.handleDangerousCopy = this.handleDangerousCopy.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleNameUpdate = this.handleNameUpdate.bind(this)

    const nameValue = props.navigation.getParam('account').name

    this.state = {
      nameValue,
      priorNameValue: nameValue,
    }
  }

  static navigationOptions = {
    title: 'Account Details',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  async handleActivate() {
    const { navigation } = this.props
    const { address } = navigation.getParam('account')

    try {
      originWallet.setWeb3Address(address)

      navigation.goBack()
    } catch(e) {
      console.error(e)
    }
  }

  async handleDangerousCopy(privateKey) {
    Alert.alert(
      'Important!',
      'As a security precaution, your key will be removed from the clipboard after one minute.',
      [
        { text: 'Got it.', onPress: async () => {
          await Clipboard.setString(privateKey)

          Alert.alert('Copied to clipboard!')

          setTimeout(async () => {
            const s = await Clipboard.getString()

            if (s === privateKey) {
              Clipboard.setString('')
            }
          }, ONE_MINUTE)
        }},
      ],
    )
  }

  handleDelete() {
    const { navigation } = this.props
    const { address } = navigation.getParam('account')

    Alert.alert(
      'Important!',
      'Have you backed up your private key for this account? ' +
      'The account will be permanently deleted and you must have the private key to recover it. ' +
      'Are you sure that you want to delete this account?',
      [
        { text: 'Cancel' },
        { text: 'Delete', onPress: () => {
          try {
            originWallet.removeAccount(address)

            navigation.goBack()
          } catch(e) {
            console.error(e)
          }
        }},
      ],
    )
  }

  handleNameChange(e) {
    const nameValue = e.nativeEvent.text

    this.setState({ nameValue })
  }

  handleNameUpdate() {
    const { nameValue, priorNameValue } = this.state
    const { navigation } = this.props
    const { address } = navigation.getParam('account')

    nameValue !== priorNameValue && originWallet.nameAccount(address, nameValue.trim())
  }

  showPrivateKey(address) {
    const privateKey = originWallet.getPrivateKey(address)

    Alert.alert('Private Key', privateKey)
  }

  render() {
    const { nameValue, priorNameValue } = this.state
    const { navigation, wallet } = this.props
    const account = navigation.getParam('account')
    const { address, name } = account
    const privateKey = originWallet.getPrivateKey(address)
    const multipleAccounts = wallet.accounts.length > 1
    const isActive = address === wallet.address

    return (
      <View style={styles.wrapper}>
        <View contentContainerStyle={styles.content} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>NAME</Text>
          </View>
          <TextInput
            placeholder={'Unnamed Account'}
            value={name === priorNameValue ? nameValue : name}
            style={styles.input}
            onChange={this.handleNameChange}
            onSubmitEditing={this.handleNameUpdate}
          />
          <View style={styles.header}>
            <Text style={styles.heading}>ETH ADDRESS</Text>
          </View>
          <TextInput
            editable={false}
            value={truncateAddress(address, 14)}
            style={styles.input}
          />
        </View>
        <View style={styles.buttonsContainer}>
          {multipleAccounts &&
            <OriginButton
              size="large"
              type="primary"
              disabled={isActive}
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Make Active Account'}
              onPress={this.handleActivate}
            />
          }
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Show Private Key'}
            onPress={() => this.showPrivateKey(address)}
          />
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Copy Private Key'}
            onPress={() => this.handleDangerousCopy(privateKey)}
          />
          {multipleAccounts &&
            <OriginButton
              size="large"
              type="danger"
              disabled={isActive}
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Delete Account'}
              onPress={this.handleDelete}
            />
          }
        </View>
      </View>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return {
    wallet
  }
}

export default connect(mapStateToProps)(AccountScreen)

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    marginHorizontal: 20,
  },
  buttonsContainer: {
    marginBottom: 10,
    paddingTop: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5,
  },
  iconContainer: {
    height: 17,
    justifyContent: 'center',
  },
  image: {
    height: 24,
    width: 24,
  },
  input: {
    backgroundColor: 'white',
    fontFamily: 'Lato',
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: '5%',
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%',
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato',
  },
  wrapper: {
    backgroundColor: '#f7f8f8',
    flex: 1,
  },
})
