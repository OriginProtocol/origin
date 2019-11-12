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
        <fbt desc="RecoveryPhraseExplainer.title">Write It Down</fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="RecoveryPhraseExplainer.subtitle">
          If your device gets lost or stolen, you must use your recovery phrase
          to restore access to your wallet.
        </fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="RecoveryPhraseExplainer.warning">
          Keep your recovery phrase safe! Never share it with anyone and make
          sure that it can't be lost or destroyed.
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
