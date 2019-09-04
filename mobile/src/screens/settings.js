'use strict'

import React, { Fragment } from 'react'
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

const settingsScreen = props => (
  <ScrollView style={styles.menuContainer}>
    <View style={styles.menuHeadingContainer}>
      <Text style={styles.menuHeading}>
        <fbt desc="SettingsScreen.generalHeading">General</fbt>
      </Text>
    </View>

    <TouchableHighlight onPress={() => props.navigation.navigate('Accounts')}>
      <View style={styles.menuItem}>
        <Text style={styles.menuText}>
          <fbt desc="SettingsScreen.accountsItem">Accounts</fbt>
        </Text>
        <View style={styles.menuItemIconContainer}>
          <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
        </View>
      </View>
    </TouchableHighlight>

    <TouchableHighlight onPress={() => props.navigation.navigate('Language')}>
      <View style={styles.menuItem}>
        <Text style={styles.menuText}>
          <fbt desc="SettingsScreen.languageItem">Language</fbt>
        </Text>
        <View style={styles.menuItemIconContainer}>
          <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
        </View>
      </View>
    </TouchableHighlight>

    <TouchableHighlight onPress={() => props.navigation.navigate('Currency')}>
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
  setNetwork: network => dispatch(setNetwork(network))
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
