'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

class LearnCard extends Component {
  render() {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>
          <fbt desc="LearnCard.title">Blockchain & Your Personal Data</fbt>
        </Text>
        <Text style={styles.content}>
          By creating a profile, you are associating your name and photo with
          your Ethereum account. This means that others will be able to connect
          your blockchain transactions to your name and photo.
        </Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Got it'}
            onPress={this.props.onRequestClose}
          />
        </View>
      </View>
    )
  }
}

export default LearnCard

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
