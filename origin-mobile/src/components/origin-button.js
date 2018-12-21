import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default class OriginButton extends Component {
  render() {
    const { onPress, size, style, textStyle, title, type } = this.props
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
      <TouchableOpacity onPress={onPress} style={{ width: size === 'large' ? '100%' : undefined }}>
        <View style={[ { backgroundColor, borderColor }, (styles[size] || styles.small), styles.button, style]}>
          <Text style={[ { color }, styles.buttonText, textStyle ]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
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
  large: {
    borderRadius: 25,
    height: 50,
  },
  small: {
    borderRadius: 15,
    height: 30,
  },
})
