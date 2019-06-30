'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import OnboardingStyles from 'styles/onboarding'

class ImportAccountScreen extends Component {
  render() {
    return (
      <SafeAreaView style={styles.content}>
        <View
          style={{ ...styles.container, justifyContent: 'center', flexGrow: 2 }}
        >
          <Text style={styles.title}>
            <fbt desc="ImportScreen.title">Import your wallet</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="ImportScreen.subtitle">
              You can import a wallet using one of the methods below.
            </fbt>
          </Text>
        </View>
        <View style={{ ...styles.container, justifyContent: 'flex-end' }}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt(
              'Use Recovery Phrase',
              'ImportScreen.useRecoveryPhraseButton'
            )}
            onPress={() => this.props.navigation.navigate('ImportMnemonic')}
          />
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Use Private Key', 'ImportScreen.usePrivateKeyButton')}
            onPress={() => this.props.navigation.navigate('ImportPrivateKey')}
          />
        </View>
      </SafeAreaView>
    )
  }
}

export default ImportAccountScreen

const styles = OnboardingStyles
