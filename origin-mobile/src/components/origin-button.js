import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default class OriginButton extends Component {
  constructor(props) {
    super(props)

    this.state = { pressed: false }
  }

  render() {
    const { deactivate, disabled, image, outline, size, style, textStyle, title, type, onDisabledPress, onPress } = this.props
    const { pressed } = this.state
    let backgroundColor, borderColor, color
    
    switch(type) {
      case 'primary':
        backgroundColor = outline ? 'transparent' : '#1a82ff'
        borderColor = '#1a82ff'
        color = outline ? '#1a82ff' : 'white'
        break
      case 'success':
        backgroundColor = outline ? 'transparent' : '#26d198'
        borderColor = '#26d198'
        color = outline ? '#26d198' : 'white'
        break
      default:
        backgroundColor = outline ? 'transparent' : '#ff0000'
        borderColor = '#ff0000'
        color = outline ? '#ff0000' : 'white'
    }

    return (
      <TouchableOpacity activeOpacity={disabled || pressed ? 1 : 0.5} onPress={() => {
        if (deactivate && pressed) {
          return
        }

        if (deactivate) {
          this.setState({ pressed: true })
        }

        if (disabled && onDisabledPress) {
          onDisabledPress()
        }

        if (!disabled && onPress) {
          onPress()
        }
      }} style={{ width: size === 'large' ? '100%' : undefined }}>
        <View style={[ { backgroundColor, borderColor, opacity: disabled || pressed ? 0.2 : 1 }, (styles[size] || styles.small), styles.button, style]}>
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
