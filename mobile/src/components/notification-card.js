'use strict'

import React from 'react'
import {
  StyleSheet,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import AndroidOpenSettings from 'react-native-android-open-settings'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const NotificationCard = props => (
  <View style={styles.card}>
    <Text style={styles.heading}>
      <fbt desc="NotificationCard.heading">Enable Notifications</fbt>
    </Text>
    <Text style={styles.content}>
      <fbt desc="NotificationCard.message">
        Woops! It looks like you have notifications disabled. To get the latest
        updates about your transactions we recommend enabling them in the
        settings for the Origin Marketplace application.
      </fbt>
    </Text>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        textStyle={styles.buttonTextt}
        title={fbt('Open Settings', 'NotificationCard.button')}
        onPress={() => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:')
          } else {
            AndroidOpenSettings.appDetailsSettings()
          }
        }}
      />
    </View>
    <TouchableOpacity onPress={props.onRequestClose}>
      <Text style={styles.cancel}>
        <fbt desc="NotificationCard.cancel">Close</fbt>
      </Text>
    </TouchableOpacity>
  </View>
)

export default NotificationCard

const styles = StyleSheet.create({
  ...CommonStyles,
  buttonContainer: {
    paddingBottom: 20
  }
})
