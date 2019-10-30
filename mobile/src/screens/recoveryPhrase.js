'use strict'

import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import Disclaimer from 'components/disclaimer'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

const RecoveryPhraseScreen = ({ navigation, wallet }) => (
  <SafeAreaView style={styles.container}>
    <BackArrow onClick={() => navigation.goBack(null)} />
    <View style={styles.content}>
      <Text style={styles.title}>
        <fbt desc="RecoveryPhrase.title">Your recovery phrase</fbt>
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
      <View style={styles.recoveryContainer}>
        {wallet.activeAccount.mnemonic.split(' ').map((word, i) => {
          return (
            <View style={styles.recoveryWordContainer} key={i}>
              <Text style={styles.recoveryWordNumber}>{i + 1} </Text>
              <Text style={styles.recoveryWord}>{word}</Text>
            </View>
          )
        })}
      </View>
      <Disclaimer>
        <fbt desc="RecoveryPhrase.disclaimer">
          Remember: You are responsible for your recovery phrase and we will not
          store it.
        </fbt>
      </Disclaimer>
    </View>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Continue', 'RecoveryPhrase.continueButton')}
        onPress={() => {
          navigation.navigate('RecoveryPhraseVerify')
        }}
      />
    </View>
  </SafeAreaView>
)

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(RecoveryPhraseScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  recoveryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#f0f6f9',
    borderRadius: 15
  },
  recoveryWordContainer: {
    paddingVertical: 10,
    width: '30%',
    flexDirection: 'row'
  },
  recoveryWordNumber: {
    fontSize: 16,
    color: '#6a8296',
    textAlign: 'right',
    width: '15%',
    marginRight: '5%'
  },
  recoveryWord: {
    fontSize: 16,
    textAlign: 'left',
    width: '75%'
  }
})
