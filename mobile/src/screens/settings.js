'use strict'

import React, { Fragment } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Switch,
  Alert,
  Platform,
  Linking
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import TouchID from 'react-native-touch-id'
import AndroidOpenSettings from 'react-native-android-open-settings'

import { setBiometryType, setNetwork, setPin } from 'actions/Settings'
import { NETWORKS, VERSION } from '../constants'
import AuthenticationGuard from 'components/authentication-guard'
import CommonStyles from 'styles/common'
import MenuStyles from 'styles/menu'

const IMAGES_PATH = '../../assets/images/'

class settingsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      biometryType: null,
      biometryError: {},
<<<<<<< HEAD
      displayRemovePinGuard: false
=======
      authGuardCallback: false
>>>>>>> master
    }
  }

  componentDidMount() {
    TouchID.isSupported()
      .then(biometryType => this.setState({ biometryType }))
      .catch(() => {
        console.debug('No biometry available')
      })
  }

  touchAuthenticate = () => {
    TouchID.authenticate('Access Origin Marketplace App')
      .then(() => {
        if (!this.props.settings.biometryType) {
          this.props.setBiometryType(this.state.biometryType)
        } else {
          this.props.setBiometryType(false)
        }
      })
      .catch(error => {
        console.warn('Biometry failure: ', error)
<<<<<<< HEAD
        this.alertMessage(
          String(
            fbt('Permission denied', 'Authentication.permissionDeniedTitle')
          ),
          String(
            fbt(
              `It looks like you have ` +
                fbt.param('biometryType', this.state.biometryType) +
                ` disabled. You will need to enable it in the settings for the
          Origin Marketplace App.`,
              'Authentication.permissionDeniedDescription'
            )
          ),
          () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:')
            } else {
              AndroidOpenSettings.appDetailsSettings()
=======
        if (error.name === 'LAErrorTouchIDNotEnrolled') {
          this.alertMessage(
            String(
              fbt('Permission denied', 'Authentication.permissionDeniedTitle')
            ),
            String(
              fbt(
                `It looks like you have ` +
                  fbt.param('biometryType', this.state.biometryType) +
                  ` disabled. You will need to enable it in the settings for the
            Origin Marketplace App.`,
                'Authentication.permissionDeniedDescription'
              )
            ),
            () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:')
              } else {
                AndroidOpenSettings.appDetailsSettings()
              }
>>>>>>> master
            }
          )
        }
      })
  }

  alertMessage = (label, message, confirm) => {
    Alert.alert(String(label), message, [
      {
        text: String(fbt('OK', 'Authentication.alertConfirmButton')),
        onPress: async () => {
          confirm()
        }
      },
      { text: String(fbt('Cancel', 'Authentication.alertCancelButton')) }
    ])
  }

  onRemovePin = () => {
    this.setState({ displayRemovePinGuard: false })
    this.props.setPin(false)
  }

  render() {
    return (
      <>
<<<<<<< HEAD
        {this.state.displayRemovePinGuard && (
          <AuthenticationGuard onSuccess={this.onRemovePin} />
=======
        {this.state.authGuardCallback && (
          <AuthenticationGuard
            onSuccess={() => {
              if (this.state.authGuardCallback === 'RemovePin') {
                this.props.setPin(false)
              } else if (this.state.authGuardCallback === 'ChangePin') {
                this.props.navigation.navigate('ChangePin')
              }
              this.setState({ authGuardCallback: false })
            }}
          />
>>>>>>> master
        )}
        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuHeadingContainer}>
            <Text style={styles.menuHeading}>
              <fbt desc="SettingsScreen.generalHeading">General</fbt>
            </Text>
          </View>

          <TouchableHighlight
            onPress={() => this.props.navigation.navigate('Accounts')}
          >
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>
                <fbt desc="SettingsScreen.accountsItem">Accounts</fbt>
              </Text>
              <View style={styles.menuItemIconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
              </View>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => this.props.navigation.navigate('Language')}
          >
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>
                <fbt desc="SettingsScreen.languageItem">Language</fbt>
              </Text>
              <View style={styles.menuItemIconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
              </View>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => this.props.navigation.navigate('Currency')}
          >
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>
                <fbt desc="SettingsScreen.languageItem">Currency</fbt>
              </Text>
              <View style={styles.menuItemIconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
              </View>
            </View>
          </TouchableHighlight>

          <View style={styles.menuHeadingContainer}>
            <Text style={styles.menuHeading}>
              <fbt desc="SettingsScreen.networkHeading">Network</fbt>
            </Text>
          </View>

          {NETWORKS.map(network => (
            <Fragment key={network.name}>
              <TouchableHighlight
                onPress={() => this.props.setNetwork(network)}
              >
                <View style={styles.menuItem}>
                  <Text style={styles.menuText}>{network.name}</Text>
                  <View style={styles.menuItemIconContainer}>
                    {network.name === this.props.settings.network.name && (
                      <Image
                        source={require(`${IMAGES_PATH}selected.png`)}
                        style={styles.menuItemIcon}
                      />
                    )}
                    {network.name !== this.props.settings.network.name && (
                      <Image
                        source={require(`${IMAGES_PATH}deselected.png`)}
                        style={styles.menuItemIcon}
                      />
                    )}
                  </View>
                </View>
              </TouchableHighlight>
            </Fragment>
          ))}

          <View style={styles.menuHeadingContainer}>
            <Text style={styles.menuHeading}>
              <fbt desc="SettingsScreen.generalHeading">SECURITY</fbt>
            </Text>
          </View>

          {this.state.biometryType !== null && (
            <TouchableHighlight>
              <View style={styles.menuItem}>
                <Text style={styles.menuText}>
                  {this.state.biometryType === 'FaceID'
                    ? 'Face ID'
                    : 'Touch ID'}
                </Text>
                <View style={styles.menuItemIconContainer}>
                  <Switch
                    trackColor={{ true: '#1a82ff' }}
                    value={!!this.props.settings.biometryType}
                    onChange={() => this.touchAuthenticate()}
                  />
                </View>
              </View>
            </TouchableHighlight>
          )}

          <TouchableHighlight>
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>
                <fbt desc="SettingsScreen.pinHeading">PIN Code</fbt>
              </Text>
              <View style={styles.menuItemIconContainer}>
                <Switch
                  trackColor={{ true: '#1a82ff' }}
                  value={!!this.props.settings.pin}
                  onValueChange={value => {
                    if (!value) {
<<<<<<< HEAD
                      this.setState({ displayRemovePinGuard: true })
                    } else {
                      this.props.navigation.navigate('ChangePin')
=======
                      // Removing a PIN
                      this.setState({ authGuardCallback: 'RemovePin' })
                    } else {
                      if (
                        this.props.settings.pin ||
                        this.props.settings.biometryType
                      ) {
                        // Have some sort of auth, display the authentication guard
                        this.setState({ authGuardCallback: 'ChangePin' })
                      } else {
                        this.props.navigation.navigate('ChangePin')
                      }
>>>>>>> master
                    }
                  }}
                />
              </View>
            </View>
          </TouchableHighlight>

          {!!this.props.settings.pin && (
            <TouchableHighlight
<<<<<<< HEAD
              onPress={() => this.props.navigation.navigate('ChangePin')}
=======
              onPress={() => {
                this.setState({ authGuardCallback: 'ChangePin' })
              }}
>>>>>>> master
            >
              <View style={styles.menuItem}>
                <Text style={styles.menuText}>
                  <fbt desc="SettingsScreen.languageItem">Change PIN Code</fbt>
                </Text>
                <View style={styles.menuItemIconContainer}>
                  <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
                </View>
              </View>
            </TouchableHighlight>
          )}

          <View style={styles.menuHeadingContainer}>
            <Text style={styles.menuHeading}>
              <fbt desc="SettingsScreen.versionHeading">Version</fbt>
            </Text>
          </View>

          <TouchableHighlight>
            <View style={[styles.menuItem, styles.menuItemInactionable]}>
              <Text style={styles.menuText}>{VERSION}</Text>
            </View>
          </TouchableHighlight>
        </ScrollView>
      </>
    )
  }
}

settingsScreen.navigationOptions = () => {
  return {
    title: String(fbt('Settings', 'SettingsScreen.headerTitle')),
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: network => dispatch(setNetwork(network)),
  setBiometryType: biometryType => dispatch(setBiometryType(biometryType)),
  setPin: pin => dispatch(setPin(pin))
})

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(mapStateToProps, mapDispatchToProps)(settingsScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...MenuStyles
})
