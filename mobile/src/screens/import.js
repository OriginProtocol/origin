'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

class ImportAccountScreen extends Component {
  render() {
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
          <OriginButton
            size="large"
            type="primary"
            title={fbt(
              'Use Recovery Phrase',
              'ImportScreen.useRecoveryPhraseButton'
            )}
            onPress={() => this.props.navigation.navigate('ImportMnemonic')}
          />
          <OriginButton
            size="large"
            type="primary"
            title={fbt('Use Private Key', 'ImportScreen.usePrivateKeyButton')}
            onPress={() => this.props.navigation.navigate('ImportPrivateKey')}
          />
        </View>
      </SafeAreaView>
    )
  }
}

export default ImportAccountScreen

const styles = StyleSheet.create({
  ...CommonStyles
})
