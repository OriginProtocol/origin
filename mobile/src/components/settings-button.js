'use strict'

import React from 'react'
import { Linking, Platform } from 'react-native'
import AndroidOpenSettings from 'react-native-android-open-settings'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

export const SettingsButton = ({ title }) => (
  <OriginButton
    size="large"
    type="primary"
    textStyle={{ fontSize: 18, fontWeight: '900' }}
    title={title || fbt('Open Settings', 'SettingsButton.openSettingsButton')}
    onPress={() => {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:')
      } else {
        AndroidOpenSettings.appDetailsSettings()
      }
    }}
  />
)
