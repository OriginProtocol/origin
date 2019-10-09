'use strict'

import React, { Fragment } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Switch
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import TouchID from 'react-native-touch-id'

import { setNetwork, setBiometryType } from 'actions/Settings'
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
          this.setState({ biometryError: error })
        })
    } else {
      this.props.setBiometryType(null)
    }
  }

  render() {
    const props = this.props
    let biometryStatus = false
    if (props.settings.biometryType !== null) {
      biometryStatus = true
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

        <TouchableHighlight onPress={() => {}}>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Face ID</Text>
            <View style={styles.menuItemIconContainer}>
              <Switch
                trackColor={{ true: '#1a82ff' }}
                value={biometryStatus}
                onChange={() => this.touchAuthenticate()}
              />
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={() => {}}>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>PIN Code</Text>
            <View style={styles.menuItemIconContainer}>
              <Switch
                trackColor={{ true: '#1a82ff' }}
                value={true}
                onChange={() => this.touchAuthenticate()}
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
  setBiometryType: biometryType => dispatch(setBiometryType(biometryType))
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
