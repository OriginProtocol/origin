'use strict'

import React, { Component } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class Selling extends Component {
  constructor(props) {
    super(props)

    this.handlePress = this.handlePress.bind(this)
  }

  handlePress() {
    this.props.navigation.navigate('Marketplace')
  }

  render() {
    const { height, width } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <View style={styles.container}>
        <Image
          source={require(`${IMAGES_PATH}eth-pile.png`)}
          resizeMethod={'scale'}
          resizeMode={'contain'}
          style={
            smallScreen
              ? { height: '25%', marginBottom: 15 }
              : { marginBottom: 30 }
          }
        />
        <Text style={styles.heading}>Start Selling On Origin</Text>
        <Text style={styles.paragraph}>
          Create your first listing in minutes by opening the Origin
          decentralized marketplace application from right here in your wallet.
        </Text>
        <OriginButton
          size="large"
          type="primary"
          title="Open Marketplace"
          textStyle={styles.buttonText}
          onPress={this.handlePress}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '900'
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 30
  },
  heading: {
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 10
  },
  paragraph: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 30,
    textAlign: 'center'
  }
})
