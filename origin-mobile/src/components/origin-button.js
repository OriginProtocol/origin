import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default class OriginButton extends Component {
  render() {
    const { disabled, image, size, style, textStyle, title, type, onDisabledPress, onPress } = this.props
    let backgroundColor, borderColor, color
    
    switch(type) {
      case 'primary':
        backgroundColor = '#1a82ff'
        borderColor = '#1a82ff'
        color = 'white'
        break
      case 'success':
        backgroundColor = '#26d198'
        borderColor = '#26d198'
        color = 'white'
        break
      default:
        backgroundColor = 'transparent'
        borderColor = '#ff0000'
        color = '#ff0000'
    }

    return (
      <TouchableOpacity activeOpacity={disabled ? 1 : 0.5} onPress={() => {
        if (disabled && onDisabledPress) {
          onDisabledPress()
        }

        if (!disabled && onPress) {
          onPress()
        }
      }} style={{ width: size === 'large' ? '100%' : undefined }}>
        <View style={[ { backgroundColor, borderColor, opacity: disabled ? 0.2 : 1 }, (styles[size] || styles.small), styles.button, style]}>
          <Text style={[ { color }, styles.buttonText, textStyle ]}>
            {title}
          </Text>
          {image &&
            <View style={styles.image}>
              {image}
            </View>
          }
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  },
  buttonText: {
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  image: {
    marginLeft: 10,
  },
  large: {
    borderRadius: 25,
    height: 50,
  },
  small: {
    borderRadius: 15,
    height: 30,
  },
})
