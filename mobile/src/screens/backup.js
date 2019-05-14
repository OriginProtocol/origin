'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import OriginButton from 'components/origin-button'

const ONE_MINUTE = 1000 * 60
const IMAGES_PATH = '../../assets/images/'

class BackupScreen extends Component {
  static navigationOptions = () => {
    return {
      header: null
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      step: 'backup',
      privateKeyVerify: null
    }
    this.isPrivateKey = this.props.wallet.activeAccount.mnemonic === undefined
  }

  async handleDangerousCopy(data) {
    Alert.alert(
      'Important!',
      'As a security precaution, the clipboard will be cleared after one minute.',
      [
        {
          text: 'Got it.',
          onPress: async () => {
            await Clipboard.setString(data)

            Alert.alert('Copied to clipboard!')

            setTimeout(async () => {
              if ((await Clipboard.getString()) === data) {
                Clipboard.setString('')
              }
            }, ONE_MINUTE)
          }
        }
      ]
    )
  }

  backupIsVerified() {
    const { wallet } = this.props
    if (this.isPrivateKey) {
      return this.state.privateKeyVerify === wallet.activeAccount.privateKey
    } else {
      return false
    }
  }

  render() {
    if (this.state.step === 'backup') {
      return this.renderBackup()
    } else if (this.state.step === 'verify') {
      return this.renderVerify()
    } else if (this.state.step === 'success') {
      return this.renderSuccess()
    }
  }

  renderBackup() {
    const { wallet } = this.props

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {this.isPrivateKey ? 'Private Key' : 'Recovery Phrase'}
          </Text>
          <Text style={styles.subtitle}>
            Write down your{' '}
            {this.isPrivateKey ? 'private key' : 'recovery phrase'}
          </Text>
          {this.isPrivateKey && (
            <View style={styles.privateKeyContainer}>
              <Text style={styles.privateKey}>
                {wallet.activeAccount.privateKey}
              </Text>
            </View>
          )}
          {!this.isPrivateKey && (
            <View style={styles.mnemonicContainer}>
              {wallet.activeAccount.mnemonic.split(' ').map((word, i) => {
                ;<Text>
                  {i} {word}
                </Text>
              })}
            </View>
          )}
          <View>
            <OriginButton
              size="large"
              type="link"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Copy to clipboard'}
              onPress={() =>
                this.isPrivateKey
                  ? this.handleDangerousCopy(wallet.activeAccount.privateKey)
                  : this.handleDangerousCopy(wallet.activeAccount.mnemonic)
              }
            />
          </View>
          <View style={styles.descContainer}>
            <Text style={styles.desc}>
              This private key is the key to your account. Write it down, or
              copy it to a password manager. We recommend NOT emailing it to
              yourself.
            </Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Next'}
            onPress={() => this.setState({ step: 'verify' })}
          />
        </View>
      </SafeAreaView>
    )
  }

  renderVerify() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {this.isPrivateKey ? 'Private Key' : 'Recovery Phrase'}
          </Text>
          <Text style={styles.subtitle}>
            {this.isPrivateKey
              ? 'Enter your private key'
              : 'Select the words in the correct order'}
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            style={styles.input}
            onChangeText={value => {
              this.setState({ privateKeyVerify: value })
            }}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            disabled={!this.backupIsVerified()}
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Next'}
            onPress={() => this.setState({ step: 'success' })}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Go back'}
            onPress={() => this.setState({ step: 'backup' })}
          />
        </View>
      </SafeAreaView>
    )
  }

  renderSuccess() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.successContent]}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'green-checkmark.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>
            You&apos;ve successfully backed up your recovery phrase
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Done'}
            onPress={() => {
              this.props.navigation.navigate('App')
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0
  },
  content: {
    flex: 1,
    alignItems: 'center'
  },
  successContent: {
    justifyContent: 'center'
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 50,
    textAlign: 'center',
    paddingTop: 20
  },
  subtitle: {
    color: '#6a8296',
    fontSize: 14,
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  privateKeyContainer: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40
  },
  privateKey: {
    fontSize: 20,
    lineHeight: 35,
    letterSpacing: 1.2,
    textAlign: 'center'
  },
  descContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 40
  },
  desc: {
    textAlign: 'center',
    color: '#98a7b4'
  },
  image: {
    marginBottom: '10%'
  },
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300,
    height: 100
  }
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(BackupScreen)
