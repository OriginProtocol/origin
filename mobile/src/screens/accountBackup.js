'use strict'

import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'

import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

const AccountBackupScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <BackArrow onClick={() => navigation.goBack(null)} />
    <View style={styles.content}>
      <Image
        resizeMethod={'scale'}
        resizeMode={'contain'}
        source={require(IMAGES_PATH + 'wallet-backup-icon.png')}
        style={styles.image}
      />
      <Text style={styles.title}>
        <fbt desc="AccountBackup.title">Back Up Your Wallet</fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="AccountBackup.subtitle">
          Now that your wallet has been created, it&apos;s ready to be used with
          Origin.
        </fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="AccountBackup.warning">
          But what happens if you lose this device? Unless you back up your
          wallet, you will lose access to it forever. We don&apos;t store your
          recovery phrase, so we won&apos;t be able to help you access your account
          or your funds.
        </fbt>
      </Text>
    </View>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Continue', 'AccountBackup.continueButton')}
        onPress={() => {
          navigation.navigate('RecoveryPhraseExplainer')
        }}
      />
    </View>
  </SafeAreaView>
)

export default AccountBackupScreen

const styles = StyleSheet.create({
  ...CommonStyles
})
