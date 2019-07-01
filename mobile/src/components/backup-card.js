'use strict'

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import CardStyles from 'styles/card'

const BackupCard = ({ onRequestBackup, onRequestClose, wallet }) => {
  const isPrivateKey = wallet.activeAccount.mnemonic === undefined

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>
        <fbt desc="BackupCard.title">Back up account</fbt>
      </Text>
      <Text style={styles.cardContent}>
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
        <Text style={styles.cardCancelText}>
          <fbt desc="BackupCard.cancel">Back up later</fbt>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default BackupCard

const styles = StyleSheet.create({
  ...CommonStyles,
  ...CardStyles
})
