'use strict'

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const LearnCard = props => (
  <View style={styles.card}>
    <Text style={styles.cardHeading}>
      <fbt desc="LearnCard.title">Blockchain & Your Personal Data</fbt>
    </Text>
    <Text style={styles.cardContent}>
      <fbt desc="LearnCard.content">
        By creating a profile, you are associating your name and photo with your
        Ethereum account. This means that others will be able to connect your
        blockchain transactions to your name and photo.
      </fbt>
    </Text>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Got it', 'LearnCard.continue')}
        onPress={props.onRequestClose}
      />
    </View>
  </View>
)

export default LearnCard

const styles = StyleSheet.create({
  ...CommonStyles
})
