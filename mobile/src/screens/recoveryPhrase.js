'use strict'

import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'

import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

const RecoveryPhraseScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <BackArrow onClick={() => navigation.goBack(null)} />
    <View style={styles.content}>
      <Text style={styles.title}>
        <fbt desc="RecoveryPhrase.title">
          Your recovery phrase
        </fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="RecoveryPhrase.subtitle">
          Write down these 12 words in order and keep them somewhere safe.
        </fbt>
      </Text>
      <Text style={{ ...styles.subtitle, fontWeight: 'bold' }}>
        <fbt desc="RecoveryPhrase.warning">
          They are the ONLY way to recover your account.
        </fbt>
      </Text>
    </View>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        title={fbt(
          'Continue',
          'RecoveryPhrase.continueButton'
        )}
        onPress={() => {
          navigation.navigate('RecoveryPhraseVerify')
        }}
      />
    </View>
  </SafeAreaView>
)

export default RecoveryPhraseScreen

const styles = StyleSheet.create({
  ...CommonStyles
})
