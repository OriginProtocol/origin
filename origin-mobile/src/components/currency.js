import React, { Component } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

export default class Currency extends Component {
  render() {
    const { abbreviation, balance, imageSource, labelColor } = this.props

    return (
      <View style={styles.container}>
        <Image source={imageSource} style={styles.icon} />
        <View style={styles.text}>
          <Text style={{ ...styles.abbreviation, color: labelColor }}>{abbreviation}</Text>
          <Text style={styles.balance}>{Number(balance).toFixed(5)}</Text>
        </View>
        <View style={styles.circle}>
          <Text style={styles.plus}>+</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  abbreviation: {
    fontFamily: 'Lato',
    fontSize: 8,
  },
  balance: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 14,
  },
  circle: {
    alignItems: 'center',
    borderColor: '#007fff',
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    justifyContent: 'center',
    marginLeft: 'auto',
    width: 14,
  },
  container: {
    backgroundColor: '#293f55',
    borderRadius: 10,
    flexDirection: 'row',
    height: 56,
    marginRight: 10,
    padding: 10,
    width: 160,
  },
  icon: {
    height: 30,
    width: 30,
  },
  plus: {
    color: '#007fff',
    fontSize: 10,
    textAlign: 'center',
  },
  text: {
    paddingLeft: 10,
  },
})
