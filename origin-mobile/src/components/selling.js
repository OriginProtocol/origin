import React, { Component } from 'react'
import { Alert, Image, Linking, StyleSheet, Text, View } from 'react-native'
import { SELLING_URL } from 'react-native-dotenv'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class Selling extends Component {
  handlePress() {
    Linking.openURL(SELLING_URL).catch(Alert.alert);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={require(`${IMAGES_PATH}eth-pile.png`)} style={styles.image} />
        <Text style={styles.heading}>Start Selling On Origin</Text>
        <Text style={styles.paragraph}>Create your first listing in minutes by opening the Origin decentralized marketplace application from right here in your wallet.</Text>
        <OriginButton size="large" type="primary" title="Open DApp" textStyle={styles.buttonText} onPress={this.handlePress} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '900',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  heading: {
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 10,
  },
  image: {
    marginBottom: 30,
  },
  paragraph: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 30,
    textAlign: 'center',
  },
})
