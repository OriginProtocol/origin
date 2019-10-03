'use strict'

import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'
import get from 'lodash.get'

import { setAccountActive, removeAccount } from 'actions/Wallet'
import Address from 'components/address'
import Avatar from 'components/avatar'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const ONE_MINUTE = 1000 * 60

class AccountScreen extends Component {
  static navigationOptions = () => {
    return {
      title: String(fbt('Account Details', 'AccountScreen.headerTitle')),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    }
  }

  handleDangerousCopy = async privateKey => {
    Alert.alert(
      String(fbt('Important!', 'AccountScreen.dangerousCopyAlertTitle')),
      String(
        fbt(
          'As a security precaution, the clipboard will be cleared after one minute.',
          'AccountScreen.dangerousCopyAlertMessage'
        )
      ),
      [
        {
          text: String(fbt('Got it', 'AccountScreen.dangerousCopyButton')),
          onPress: async () => {
            await Clipboard.setString(privateKey)

            Alert.alert(
              String(
                fbt(
                  'Copied to clipboard!',
                  'AccountScreen.dangerousCopySuccessAlert'
                )
              )
            )

            setTimeout(async () => {
              const s = await Clipboard.getString()

              if (s === privateKey) {
                Clipboard.setString('')
              }
            }, ONE_MINUTE)
          }
        }
      ]
    )
  }

  handleDelete = () => {
    const { navigation, wallet } = this.props
    const isLastAccount = wallet.accounts.length === 1

    Alert.alert(
      String(fbt('Important!', 'AccountScreen.deleteAlertTitle')),
      String(
        fbt(
          'Have you backed up your private key or recovery phrase for this account? ' +
            'The account will be permanently deleted and you must have the private key or recovery phrase to recover it. ' +
            'Are you sure that you want to delete this account?',
          'AccountScreen.deleteAlertMessage'
        )
      ),
      [
        {
          text: String(fbt('Cancel', 'AccountScreen.deleteAlertCancelButton'))
        },
        {
          text: String(fbt('Delete', 'AccountScreen.deleteAlertConfirmButton')),
          onPress: () => {
            try {
              this.props.removeAccount(navigation.getParam('account'))
              if (isLastAccount) {
                // No accounts left, navigate back to welcome screen
                navigation.navigate('Welcome')
              } else {
                // There are still some accounts, go back to accounts list
                navigation.navigate('Accounts')
              }
            } catch (e) {
              console.error(e)
            }
          }
        }
      ]
    )
  }

  render() {
    const { navigation, settings, wallet } = this.props

    const account = navigation.getParam('account')
    const { address, privateKey, mnemonic } = account
    const multipleAccounts = wallet.accounts.length > 1
    const isActive = address === wallet.activeAccount.address

    const networkName = get(settings.network, 'name', null)
    const identity = get(wallet.identities, `${networkName}.${address}`, {})
    const avatarUrl = get(identity, 'avatarUrl')
    const fullName = get(identity, 'fullName')

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <View style={styles.container}>
            <Avatar source={avatarUrl} size={100} />
            {fullName && <Text style={styles.title}>{fullName}</Text>}
            <Address
              address={address}
              label={fbt('Address', 'AccountItem.address')}
              chars={99999}
              styles={{ fontSize: 16, marginVertical: 20 }}
            />
          </View>
          <View style={[styles.containner, styles.buttonContainer]}>
            {multipleAccounts && (
              <OriginButton
                size="large"
                type="primary"
                disabled={isActive}
                title={fbt(
                  'Make Active Account',
                  'AccountScreen.makeActiveAccountButton'
                )}
                onPress={() =>
                  this.props.setAccountActive(
                    this.props.navigation.getParam('account')
                  )
                }
              />
            )}
            {mnemonic !== undefined && (
              <>
                <OriginButton
                  size="large"
                  type="primary"
                  title={fbt(
                    'Show Recovery Phrase',
                    'AccountScreen.showRecoveryPhraseButton'
                  )}
                  onPress={() =>
                    Alert.alert(
                      String(
                        fbt('Recovery Phrase', 'AccountScreen.recoveryPhrase')
                      ),
                      mnemonic
                    )
                  }
                />
                <OriginButton
                  size="large"
                  type="primary"
                  title={fbt(
                    'Copy Recovery Phrase',
                    'AccountScreen.copyRecoveryPhraseButton'
                  )}
                  onPress={() => this.handleDangerousCopy(mnemonic)}
                />
              </>
            )}
            <OriginButton
              size="large"
              type="primary"
              title={fbt(
                'Show Private Key',
                'AccountScreen.showPrivateKeyButton'
              )}
              onPress={() =>
                Alert.alert(
                  String(fbt('Private Key', 'AccountScreen.privateKey')),
                  privateKey
                )
              }
            />
            <OriginButton
              size="large"
              type="primary"
              title={fbt(
                'Copy Private Key',
                'AccountScreen.copyPrivateKeyButton'
              )}
              onPress={() => this.handleDangerousCopy(privateKey)}
            />
            {(multipleAccounts || true) && (
              <OriginButton
                size="large"
                type="danger"
                disabled={isActive}
                title={fbt(
                  'Delete Account',
                  'AccountScreen.deleteAccountButton'
                )}
                onPress={this.handleDelete}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  removeAccount: account => dispatch(removeAccount(account)),
  setAccountActive: account => dispatch(setAccountActive(account))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountScreen)

const styles = StyleSheet.create({
  ...CommonStyles
})
