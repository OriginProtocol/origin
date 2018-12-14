import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default class OriginButton extends Component {
  render() {
    const { onPress, size, style, textStyle, title, type } = this.props

    return (
      <TouchableOpacity onPress={onPress} style={{ width: size === 'large' ? '100%' : undefined }}>
        <View style={[ {
          backgroundColor: type === 'primary' ? '#1a82ff' : 'transparent',
          borderColor: type === 'primary' ? '#1a82ff' : '#ff0000',
        }, (styles[size] || styles.small), styles.button, style]}>
          <Text style={[ {
            color: type === 'primary' ? 'white' : '#ff0000',
          }, styles.buttonText, textStyle ]}>
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
