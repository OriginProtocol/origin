'use strict'

import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'

import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

const RecoveryPhraseExplainerScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <BackArrow onClick={() => navigation.goBack(null)} />
    <View style={styles.content}>
      <Image
        resizeMethod={'scale'}
        resizeMode={'contain'}
        source={require(IMAGES_PATH + 'pencil-icon.png')}
        style={styles.image}
      />
      <Text style={styles.title}>
        <fbt desc="RecoveryPhraseExplainer.title">
          Write down your recovery phrase
        </fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="RecoveryPhraseExplainer.subtitle">
          If your device gets lost or stolen, you can restore your wallet by
          using your recovery phrase.
        </fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="RecoveryPhraseExplainer.warning">
          Please keep your recovery phrase safe. We will not store it anywhere
          and cannot help you get it back if you lose it.
        </fbt>
      </Text>
    </View>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        title={fbt(
          'View Recovery Phrase',
          'RecoveryPhraseExplainer.continueButton'
        )}
        onPress={() => {
          navigation.navigate('RecoveryPhrase')
        }}
      />
    </View>
  </SafeAreaView>
)

export default RecoveryPhraseExplainerScreen

const styles = StyleSheet.create({
  ...CommonStyles
})
