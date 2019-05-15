'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import OriginButton from 'components/origin-button'

class BackupCard extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { wallet, navigation } = this.props
    const isPrivateKey = wallet.activeAccount.mnemonic === undefined

    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Back up account</Text>
        <Text style={styles.content}>
          If you lose your account{' '}
          {isPrivateKey ? 'private key' : 'recovery phrase'}, you will not be
          able to access your funds.
        </Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={
              isPrivateKey ? 'Back up private key' : 'Back up recovery phrase'
            }
            onPress={() => navigation.navigate('Backup')}
          />
        </View>
        <TouchableOpacity onPress={this.props.onRequestClose}>
          <Text style={styles.cancel}>Back up later</Text>
        </TouchableOpacity>
      </View>
    )
  }
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
