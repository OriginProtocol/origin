import React, { Component } from 'react'
import { Alert, Clipboard, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'

import { updateBackupWarningStatus } from 'actions/Activation'

import Address from 'components/address'
import Currency from 'components/currency'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { getCurrentNetwork } from 'utils/networks'
import { toOgns } from 'utils/ogn'
import { evenlySplitAddress } from 'utils/user'

import originWallet from '../OriginWallet'

const ONE_MINUTE = 1000 * 60
const IMAGES_PATH = '../../assets/images/'

class AccountModal extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      keyError: '',
      keyValue: '',
    }
  }

  componentDidUpdate() {
    const { keyError, keyValue } = this.state

    if (keyError && !keyValue) {
      this.setState({ keyError: '' })
    }
  }

  handleChange(keyValue) {
    this.setState({ keyValue: keyValue.trim() })
  }

  async handleSubmit() {
    try {
      if (await originWallet.addAccount(this.state.keyValue)) {
        this.setState({ keyValue: '' })

        this.props.onRequestClose()
      }
    } catch(e) {
      this.setState({ keyError: e.message })
    }
  }

  render() {
    const { onPress, visible, onRequestClose } = this.props

    return (
      <Modal
        animationType="slide"
        visible={!!visible}
        onRequestClose={() => {
          onRequestClose()
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.nav}>
            <TouchableOpacity onPress={onPress} style={styles.navImageContainer}>
              <Image source={require(`${IMAGES_PATH}close-icon.png`)} style={styles.close} />
            </TouchableOpacity>
            <View style={styles.navHeadingContainer}>
              <Text style={styles.heading}>Add Account</Text>
            </View>
            <View style={styles.navImageContainer} />
          </View>
          <View style={styles.body}>
            <Text style={styles.label}>Enter Your Private Key</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              onChangeText={this.handleChange}
              onSubmitEditing={this.handleSubmit}
              value={this.state.keyValue}
              style={[styles.input, this.state.keyError ? styles.invalid : {}]}
            />
          </View>
          <View style={styles.buttonContainer}>
            <OriginButton
              size="large"
              type="primary"
              disabled={!this.state.keyValue}
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Submit Private Key'}
              onPress={this.handleSubmit}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return {
    wallet,
  }
}

export default connect(mapStateToProps)(AccountModal)

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 20,
  },
  buttonContainer: {
    backgroundColor: '#f7f8f8',
    paddingTop: 10,
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  heading: {
    fontFamily: 'Poppins',
    fontSize: 17,
    marginVertical: 'auto',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300,
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000',
  },
  label: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 24,
  },
  nav: {
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    flexDirection: 'row',
    height: 44,
  },
  navHeadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  navImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18 * 3,
  },
})
