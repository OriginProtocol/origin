'use strict'

import React, { Component, Fragment } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { setNetwork } from 'actions/Settings'
import { NETWORKS } from '../constants'
import CommonStyles from 'styles/common'
import MenuStyles from 'styles/menu'
const Package = require('../../package.json')

const IMAGES_PATH = '../../assets/images/'

class SettingsScreen extends Component {
  static navigationOptions = () => {
    return {
      title: String(fbt('Settings', 'SettingsScreen.headerTitle')),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    }
  }

  handleSetNetwork(network) {
    this.props.setNetwork(network)
  }

  render() {
    return (
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
        <View style={styles.menuHeadingContainer}>
          <Text style={styles.menuHeading}>
            <fbt desc="SettingsScreen.networkHeading">Network</fbt>
          </Text>
        </View>
        {NETWORKS.map(network => (
          <Fragment key={network.name}>
            <TouchableHighlight onPress={() => this.handleSetNetwork(network)}>
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
            <fbt desc="SettingsScreen.versionHeading">Version</fbt>
          </Text>
        </View>
        <TouchableHighlight>
          <View style={[styles.menuItem, styles.menuItemInactionable]}>
            <Text style={styles.menuText}>{Package.version}</Text>
          </View>
        </TouchableHighlight>
      </ScrollView>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: network => dispatch(setNetwork(network))
})

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...MenuStyles
})
