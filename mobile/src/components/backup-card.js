'use strict'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

const BackupCard = ({ onRequestBackup, onRequestClose, wallet }) => {
  const isPrivateKey = wallet.accounts[0].mnemonic === undefined

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        <fbt desc="BackupCard.title">Back up account</fbt>
      </Text>
      <Text style={styles.content}>
        {isPrivateKey && (
          <fbt desc="BackupCard.backupPrivateKeyDesc">
            If you lose your account private key, you will not be able to access
            your funds.
          </fbt>
        )}
        {!isPrivateKey && (
          <fbt desc="BackupCard.backupRecoveryPhraseDesc">
            If you lose your account recovery phrase, you will not be able to
            access your funds.
          </fbt>
        )}
      </Text>
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          textStyle={{ fontSize: 18, fontWeight: '900' }}
          title={
            isPrivateKey
              ? fbt('Back up private key', 'BackupCard.backupButton')
              : fbt(
                  'Back up recovery phrase',
                  'BackupCard.backupRecoveryPhraseButton'
                )
          }
          onPress={onRequestBackup}
        />
      </View>
      <TouchableOpacity onPress={onRequestClose}>
        <Text style={styles.cancel}>
          <fbt desc="BackupCard.cancel">Back up later</fbt>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default BackupCard

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
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center'
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontWeight: '600',
    fontSize: 35,
    marginBottom: 20,
    textAlign: 'center'
  }
})
