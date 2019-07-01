'use strict'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

const SignatureCard = ({ msgData, onConfirm, onRequestClose }) => {
  const decodedMessage = global.web3.utils.hexToAscii(msgData.data.data)

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        <fbt desc="SignatureCard.heading">Signature Request</fbt>
      </Text>
      <Text style={styles.content}>{decodedMessage}</Text>
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          textStyle={{ fontSize: 18, fontWeight: '900' }}
          title={fbt('Sign', 'SignatureCard.button')}
          onPress={onConfirm}
        />
      </View>
      <TouchableOpacity onPress={onRequestClose}>
        <Text style={styles.cancel}>
          <fbt desc="SignatureCard.cancel">Cancel</fbt>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default SignatureCard

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
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  }
})
