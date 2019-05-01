'use strict'

import React, { Component } from 'react'
import {
  StyleSheet,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import AndroidOpenSettings from 'react-native-android-open-settings'

import OriginButton from 'components/origin-button'

class NotificationCard extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Enable Notifications</Text>
        <Text style={styles.content}>
          Woops! It looks like you have notifications disabled. To get the
          latest updates about your transactions we recommend enabling them in
          the settings for the Origin Marketplace application.
        </Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Open Settings'}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:')
              } else {
                AndroidOpenSettings.appDetailsSettings()
              }
            }}
          />
        </View>
        <TouchableOpacity onPress={this.props.onRequestClose}>
          <Text style={styles.cancel}>Close</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default NotificationCard

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 20
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  content: {
    fontFamily: 'Lato',
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 300,
    textAlign: 'center'
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  }
})
