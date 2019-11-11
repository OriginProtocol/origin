'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setBackupWarningStatus } from 'actions/Activation'
import { shuffleArray } from 'utils'
import Disclaimer from 'components/disclaimer'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

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

    const { wallet } = this.props

    this.isPrivateKey = wallet.activeAccount.mnemonic === undefined

    // Create an empty array the same length as the mnemonic to fill when
    // verifying, or null for private keys
    let verify, shuffledMnemonic
    if (!this.isPrivateKey) {
      verify = new Array(wallet.activeAccount.mnemonic.split(' ').length).fill(
        undefined
      )
      shuffledMnemonic = shuffleArray(wallet.activeAccount.mnemonic.split(' '))
    }

    this.state = {
      step: 'backup',
      verify: verify,
      shuffledMnemonic: shuffledMnemonic,
      shuffledMnemonicBackup: shuffledMnemonic
    }
  }

  // TODO duplicate code from screens/account.js
  async handleDangerousCopy(data) {
    Alert.alert(
      String(fbt('Important!', 'BackupScreen.dangerousCopyAlertTitle')),
      String(
        fbt(
          'As a security precaution, the clipboard will be cleared after one minute.',
          'BackupScreen.dangerousCopyAlertMessage'
        )
      ),
      [
        {
          text: String(fbt('Got it', 'BackupScreen.dangerousCopyButton')),
          onPress: async () => {
            await Clipboard.setString(data)

            Alert.alert(
              String(
                fbt(
                  'Copied to clipboard!',
                  'BackupScreen.dangerousCopySuccessAlert'
                )
              )
            )

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

  handleWordTouch(word, index) {
    // Copy arrays for state update
    const newShuffledMnemonic = this.state.shuffledMnemonic.slice()
    const newVerify = this.state.verify.slice()

    if (this.state.verify[index] === word) {
      // Remove from the verify phrase
      newVerify[index] = undefined
      // Add it back to the shuffledMnemonic in the position it was in before
      // it was removed
      const smIndex = this.state.shuffledMnemonicBackup.findIndex((x, i) => {
        // Must also check the index in shuffledMnemonic is undefined to handle
        // mnemonics with the multiple words that are the same
        return x === word && this.state.shuffledMnemonic[i] === undefined
      })
      newShuffledMnemonic[smIndex] = word
    } else {
      // Remove from the shuffledMnemonic
      newShuffledMnemonic[index] = undefined
      // Add to the first empty slot of the verify phrase
      const verifyIndex = this.state.verify.findIndex(x => x === undefined)
      newVerify[verifyIndex] = word
    }

    this.setState({
      verify: newVerify,
      shuffledMnemonic: newShuffledMnemonic
    })
  }

  backupIsVerified() {
    const { wallet } = this.props
    if (this.isPrivateKey) {
      return this.state.verify === wallet.activeAccount.privateKey
    } else {
      return this.state.verify.join(' ') === wallet.activeAccount.mnemonic
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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.container}>
            {this.isPrivateKey && (
              <>
                <Text style={styles.title}>
                  <fbt desc="BackupScreen.backupPrivateKeyTitle">
                    Private Key
                  </fbt>
                </Text>
                <Text style={styles.subtitle}>
                  <fbt desc="BackupScreen.backupPrivateKeySubtitle">
                    Write down your private key
                  </fbt>
                </Text>
                <View style={styles.privateKeyContainer}>
                  <Text style={styles.privateKeyText}>
                    {wallet.activeAccount.privateKey}
                  </Text>
                </View>
              </>
            )}
            {!this.isPrivateKey && (
              <>
                <Text style={styles.title}>
                  <fbt desc="BackupScreen.backupRecoveryTitle">
                    Recovery Phrase
                  </fbt>
                </Text>
                <Text style={styles.subtitle}>
                  <fbt desc="BackupScreen.backupRecoverySubtitle">
                    Write down your recovery phrase
                  </fbt>
                </Text>
                <View style={styles.recoveryContainer}>
                  {wallet.activeAccount.mnemonic.split(' ').map((word, i) => {
                    return (
                      <View style={styles.recoveryWordContainer} key={i}>
                        <Text style={styles.recoveryWordNumber}>{i + 1} </Text>
                        <Text style={styles.recoveryWord}>{word}</Text>
                      </View>
                    )
                  })}
                </View>
              </>
            )}
            <OriginButton
              size="large"
              type="link"
              title={fbt('Copy to clipboard', 'BackupScreen.copyButton')}
              onPress={() =>
                this.isPrivateKey
                  ? this.handleDangerousCopy(wallet.activeAccount.privateKey)
                  : this.handleDangerousCopy(wallet.activeAccount.mnemonic)
              }
            />
          </View>
          <Disclaimer>
            {this.isPrivateKey && (
              <fbt desc="BackupScreen.backupPrivateKeyNote">
                This private key is the key to your account. Write it down, or
                copy it to a password manager. We recommend NOT emailing it to
                yourself.
              </fbt>
            )}
            {!this.isPrivateKey && (
              <fbt desc="BackupScreen.backupRecoveryPhraseNote">
                This recovery phrase is the key to your account. Write it down,
                or copy it to a password manager. We recommend NOT emailing it
                to yourself.
              </fbt>
            )}
          </Disclaimer>
          <View style={[styles.container, styles.buttonContainer]}>
            <OriginButton
              size="large"
              type="primary"
              title={fbt('Next', 'BackupScreen.nextButton')}
              onPress={() => this.setState({ step: 'verify' })}
            />
            <OriginButton
              size="large"
              type="link"
              title={fbt('Cancel', 'BackupScreen.cancelButton')}
              onPress={() => {
                this.props.navigation.navigate('Main')
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  renderVerify() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps={'always'}
          >
            <View style={styles.container}>
              {this.isPrivateKey && (
                <>
                  <Text style={styles.title}>
                    <fbt desc="BackupScreen.verifyPrivateKeyTitle">
                      Private Key
                    </fbt>
                  </Text>
                  <Text style={styles.subtitle}>
                    <fbt desc="BackupScreen.verifyPrivateKeySubtitle">
                      Enter your private key
                    </fbt>
                  </Text>
                  <TextInput
                    autoCapitalize="none"
                    autoFocus={true}
                    autoCorrect={false}
                    multiline={true}
                    style={styles.input}
                    onChangeText={value => {
                      this.setState({ verify: value })
                    }}
                  />
                </>
              )}
              {!this.isPrivateKey && (
                <>
                  <Text style={styles.title}>
                    <fbt desc="BackupScreen.verifyRecoveryPhraseTitle">
                      Recovery Phrase
                    </fbt>
                  </Text>
                  <Text style={styles.subtitle}>
                    <fbt desc="BackupScreen.verifyRecoveryPhraseSubtitle">
                      Select the words in the correct order
                    </fbt>
                  </Text>
                  {this.renderWordSlots(this.state.verify)}
                  {this.renderWordSlots(this.state.shuffledMnemonic)}
                </>
              )}
            </View>
            <View style={[styles.container, styles.buttonContainer]}>
              <OriginButton
                size="large"
                type="primary"
                disabled={!this.backupIsVerified()}
                title={fbt('Next', 'BackupScreen.nextButton')}
                onPress={() => this.setState({ step: 'success' })}
              />
              <OriginButton
                size="large"
                type="link"
                title={fbt('Go Back', 'BackupScreen.backButton')}
                onPress={() => this.setState({ step: 'backup' })}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }

  renderWordSlots(wordList) {
    return (
      <View style={styles.recoveryContainer}>
        {wordList.map((word, i) => {
          return (
            <TouchableOpacity
              style={[
                styles.recoveryWordSlotContainer,
                word ? '' : styles.emptyRecoveryWordSlotContainer
              ]}
              key={i}
              onPress={() => this.handleWordTouch(word, i)}
            >
              <Text
                style={[
                  styles.recoveryWordSlot,
                  word ? '' : styles.emptyRecoveryWordSlot
                ]}
              >
                {word && word}
                {!word && i + 1}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  renderSuccess() {
    const { wallet } = this.props

    return (
      <SafeAreaView style={styles.content}>
        <View style={{ ...styles.container, flexGrow: 2 }}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'green-checkmark.png')}
            style={styles.image}
          />
          <Text style={styles.title}>
            <fbt desc="BackupScreen.backupSuccess">
              You have successfully backed up your recovery phrase
            </fbt>
          </Text>
        </View>
        <View style={[styles.container, styles.buttonContainer]}>
          <OriginButton
            size="large"
            type="primary"
            title={fbt('Done', 'BackupScreen.doneButton')}
            onPress={async () => {
              await this.props.setBackupWarningStatus(
                wallet.activeAccount.address
              )
              this.props.navigation.navigate('Main')
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

const mapDispatchToProps = dispatch => ({
  setBackupWarningStatus: address => dispatch(setBackupWarningStatus(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(BackupScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  successContent: {
    justifyContent: 'center'
  },
  privateKeyContainer: {
    padding: 40
  },
  privateKeyText: {
    fontSize: 20,
    lineHeight: 35,
    letterSpacing: 1.2,
    textAlign: 'center'
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
  },
  recoveryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  recoveryWordContainer: {
    paddingVertical: 10,
    width: '30%',
    flexDirection: 'row'
  },
  recoveryWordNumber: {
    fontSize: 16,
    color: '#6a8296',
    textAlign: 'right',
    width: '15%',
    marginRight: '5%'
  },
  recoveryWord: {
    fontSize: 16,
    textAlign: 'left',
    width: '75%'
  },
  recoveryWordSlotContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#c0cbd4',
    width: '25%',
    marginBottom: 10,
    marginHorizontal: 5,
    paddingVertical: 10
  },
  recoveryWordSlot: {
    textAlign: 'center'
  },
  emptyRecoveryWordSlotContainer: {
    backgroundColor: '#f7f8f8'
  },
  emptyRecoveryWordSlot: {
    color: '#c0cbd4'
  }
})
