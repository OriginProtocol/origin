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
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import AndroidOpenSettings from 'react-native-android-open-settings'
import PushNotification from 'react-native-push-notification'
import * as Sentry from '@sentry/react-native'

import { setNotificationsRequested } from 'actions/Activation'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import CardStyles from 'styles/card'

const NotificationCard = props => (
  <View style={styles.card}>
    <Text style={styles.cardHeading}>
      <fbt desc="NotificationCard.heading">Enable Notifications</fbt>
    </Text>
    <Text style={styles.cardContent}>
      {props.activation.notificationsRequested ? (
        <fbt desc="NotificationCard.disabledMessage">
          Woops! It looks like you have notifications disabled. To get the
          latest updates about your transactions we recommend enabling them in
          the settings for the Origin Marketplace application.
        </fbt>
      ) : (
        <fbt desc="NotificationCard.enableMessage">
          Woops! It looks like you have notifications disabled. To get the
          latest updates about your transactions we recommend enabling them in
          the settings for the Origin Marketplace application.
        </fbt>
      )}
    </Text>
    <View style={styles.buttonContainer}>
      {props.activation.notificationsRequested ? (
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Open Settings', 'NotificationCard.button')}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:')
            } else {
              AndroidOpenSettings.appDetailsSettings()
            }
          }}
        />
      ) : (
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Open Settings', 'NotificationCard.button')}
          onPress={async () => {
            let permissions
            try {
              permissions = await PushNotification.requestPermissions()
            } catch (error) {
              Sentry.captureMessage(error.toString())
              props.onRequestClose()
            }

            setNotificationsRequested(true)

            if (permissions.alert) {
              props.onRequestClose()
            }
          }}
        />
      )}
    </View>
    <TouchableOpacity onPress={props.onRequestClose}>
      <Text style={styles.cardCancelText}>
        <fbt desc="NotificationCard.cancel">Close</fbt>
      </Text>
    </TouchableOpacity>
  </View>
)

const mapStateToProps = ({ activation }) => {
  return { activation }
}

const mapDispatchToProps = dispatch => ({
  setNotificationsRequested: value => dispatch(setNotificationsRequested(value))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationCard)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...CardStyles
})
