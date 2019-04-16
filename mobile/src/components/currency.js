import React, { Component } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const IMAGES_PATH = '../../assets/images/'

export default class Currency extends Component {
  render() {
    const {
      abbreviation,
      balance,
      imageSource,
      labelColor,
      name,
      precision = 5,
      onPress
    } = this.props

    return (
      <View style={styles.container}>
        <View style={{ height: 28 }}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.colored}>
            <Image source={imageSource} style={styles.icon} />
            <Text
              style={{
                ...styles.abbreviation,
                color: labelColor
              }}
            >
              {abbreviation}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <TouchableOpacity onPress={onPress}>
            <Image
              source={require(`${IMAGES_PATH}plus-icon.png`)}
              style={styles.plus}
            />
          </TouchableOpacity>
          <Text style={styles.balance}>
            {Number(balance).toFixed(precision)}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  abbreviation: {
    fontFamily: 'Lato',
    fontSize: 12,
    marginLeft: 5
  },
  balance: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 'auto',
    marginTop: 'auto'
  },
  colored: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 28
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 17
  },
  icon: {
    height: 16,
    width: 16
  },
  name: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  plus: {
    marginLeft: 'auto'
  },
  right: {
    marginLeft: 'auto'
  }
})
