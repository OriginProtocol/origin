'use strict'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import CardStyles from 'styles/card'

const SignatureCard = ({ msgData, onConfirm, onRequestClose }) => {
  const decodedMessage = global.web3.utils.hexToAscii(msgData.data.data)

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>
        <fbt desc="SignatureCard.heading">Signature Request</fbt>
      </Text>
      <Text style={styles.cardContent}>{decodedMessage}</Text>
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Sign', 'SignatureCard.button')}
          onPress={onConfirm}
        />
      </View>
      <TouchableOpacity onPress={onRequestClose}>
        <Text style={styles.cardCancelText}>
          <fbt desc="SignatureCard.cancel">Cancel</fbt>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default SignatureCard

const styles = StyleSheet.create({
  ...CommonStyles,
  ...CardStyles
})
