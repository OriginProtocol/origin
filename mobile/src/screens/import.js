'use strict'

import React from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const importAccountScreen = props => {
  const canUseSamsungBKS =
    Platform.OS === 'android' &&
    get(props, 'samsungBKS.seedHash', '').length > 0

  const renderImportButtons = () => {
    return (
      <>
        <OriginButton
          size="large"
          type="primary"
          title={fbt(
            'Use Recovery Phrase',
            'ImportScreen.useRecoveryPhraseButton'
          )}
          onPress={() => props.navigation.navigate('ImportMnemonic')}
        />
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Use Private Key', 'ImportScreen.usePrivateKeyButton')}
          onPress={() => props.navigation.navigate('ImportPrivateKey')}
        />
      </>
    )
  }

  const renderAddSamsungBKSAccountButton = () => {
    return (
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Add Account', 'ImportScreen.addSamsungBKSAccount')}
        onPress={() => {
          console.log('Add account')
        }}
      />
    )
  }

  if (canUseSamsungBKS) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ ...styles.container, flexGrow: 2 }}>
          <Text style={styles.title}>
            <fbt desc="ImportScreen.keystoreTitle">Samsung Keystore</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="ImportScreen.keystoreSubtitle">
              Your wallet is managed by the Samsung Blockchain Keystore.
            </fbt>
          </Text>
        </View>
        <View style={{ ...styles.container, ...styles.buttonContainer }}>
          {renderAddSamsungBKSAccountButton()}
          {__DEV__ && (
            <>
              <Text
                style={{ ...styles.text, marginTop: 30, marginBottom: 10 }}
              >
                Developer Options
              </Text>
              {renderImportButtons()}
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ ...styles.container, flexGrow: 2 }}>
        <Text style={styles.title}>
          <fbt desc="ImportScreen.title">Import your wallet</fbt>
        </Text>
        <Text style={styles.subtitle}>
          <fbt desc="ImportScreen.subtitle">
            You can import a wallet using one of the methods below.
          </fbt>
        </Text>
      </View>
      <View style={{ ...styles.container, ...styles.buttonContainer }}>
        {renderImportButtons()}
      </View>
    </SafeAreaView>
  )
}

export default importAccountScreen

const styles = StyleSheet.create({
  ...CommonStyles,
  text: {
    textAlign: 'center',
    color: '#98a7b4',
    fontFamily: 'Lato'
  }
})
