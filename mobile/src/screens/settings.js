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

import {
  setNetwork,
  setBiometryType,
  setPin,
  setPinStatus
} from 'actions/Settings'
import { NETWORKS, VERSION } from '../constants'
import CommonStyles from 'styles/common'
import MenuStyles from 'styles/menu'

const IMAGES_PATH = '../../assets/images/'

class settingsScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      biometryType: null,
      biometryError: {}
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
    if (this.props.settings.biometryType === null) {
      TouchID.authenticate('Access Origin Marketplace App')
        .then(() => {
          this.props.setBiometryType(this.state.biometryType)
        })
        .catch(error => {
          console.warn('Biometry failure: ', error)
          this.alertMessage(
            'Permission denined',
            `It looks like you have ${this.state.biometryType} disabled. You will need to enable it in the settings for the
          Origin Marketplace App.`,
            () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:')
              } else {
                AndroidOpenSettings.appDetailsSettings()
              }
            }
          )
        })
    } else {
      this.props.setBiometryType(null)
    }
  }

  setPin = () => {
    const { settings, setPinStatus, navigation } = this.props
    if (settings.pin === null) {
      navigation.navigate('Pin')
    } else {
      setPinStatus(!settings.pinStatus)
    }
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

  render() {
    const props = this.props
    let biometryStatus = false
    if (props.settings.biometryType !== null) {
      biometryStatus = true
    }

    let biometrytText = ''
    if (this.state.biometryType === 'FaceID') {
      biometrytText = 'Face ID'
    } else if (
      this.state.biometryType === 'TouchID' ||
      this.state.biometryType
    ) {
      biometrytText = 'Touch ID'
    }

    return (
      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuHeadingContainer}>
          <Text style={styles.menuHeading}>
            <fbt desc="SettingsScreen.generalHeading">General</fbt>
          </Text>
        </View>

        <TouchableHighlight
          onPress={() => props.navigation.navigate('Accounts')}
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
          onPress={() => props.navigation.navigate('Language')}
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
          onPress={() => props.navigation.navigate('Currency')}
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
            <TouchableHighlight onPress={() => props.setNetwork(network)}>
              <View style={styles.menuItem}>
                <Text style={styles.menuText}>{network.name}</Text>
                <View style={styles.menuItemIconContainer}>
                  {network.name === props.settings.network.name && (
                    <Image
                      source={require(`${IMAGES_PATH}selected.png`)}
                      style={styles.menuItemIcon}
                    />
                  )}
                  {network.name !== props.settings.network.name && (
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
              <Text style={styles.menuText}>{biometrytText}</Text>
              <View style={styles.menuItemIconContainer}>
                <Switch
                  trackColor={{ true: '#1a82ff' }}
                  value={biometryStatus}
                  onChange={() => this.touchAuthenticate()}
                />
              </View>
            </View>
          </TouchableHighlight>
        )}

        <TouchableHighlight>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>PIN Code</Text>
            <View style={styles.menuItemIconContainer}>
              <Switch
                trackColor={{ true: '#1a82ff' }}
                value={props.settings.pinStatus}
                onChange={() => this.setPin()}
              />
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => props.navigation.navigate('ChangePin')}
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
  setPin: pin => dispatch(setPin(pin)),
  setPinStatus: status => dispatch(setPinStatus(status))
})

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(settingsScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...MenuStyles
})
