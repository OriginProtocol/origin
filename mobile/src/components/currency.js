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
      vertical,
      onPress
    } = this.props

    return vertical ? (
      <View style={{ ...styles.container, ...styles.vertical }}>
        <View style={{ height: 28 }}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.colored}>
            <Image source={imageSource} style={styles.iconSmall} />
            <Text
              style={{
                ...styles.abbreviation,
                ...styles.abbreviationLarge,
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
          <Text style={{ ...styles.balance, ...styles.balanceLarge }}>
            {Number(balance).toFixed(5)}
          </Text>
        </View>
      </View>
    ) : (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View style={{ ...styles.container, ...styles.horizontal }}>
          <Image source={imageSource} style={styles.iconLarge} />
          <View style={styles.text}>
            <Text style={{ ...styles.abbreviation, color: labelColor }}>
              {abbreviation}
            </Text>
            <Text style={styles.balance}>{Number(balance).toFixed(5)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  abbreviation: {
    fontFamily: 'Lato',
    fontSize: 8
  },
  abbreviationLarge: {
    fontSize: 12,
    marginLeft: 5
  },
  balance: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 14
  },
  balanceLarge: {
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
    backgroundColor: '#293f55',
    borderRadius: 10,
    flexDirection: 'row'
  },
  horizontal: {
    height: 56,
    marginRight: 10,
    padding: 10,
    width: 160
  },
  iconLarge: {
    height: 30,
    width: 30
  },
  iconSmall: {
    height: 16,
    width: 16
  },
  name: {
    color: 'white',
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
  },
  text: {
    paddingLeft: 10
  },
  vertical: {
    marginBottom: 10,
    padding: 17
  }
})
