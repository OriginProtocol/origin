'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const { height } = Dimensions.get('window')
const smallScreen = height < 812

export default class OriginButton extends Component {
  constructor(props) {
    super(props)
    this.state = { pressed: false }
  }

  render() {
    const {
      deactivate,
      disabled,
      image,
      loading,
      outline,
      size,
      style,
      textStyle,
      title,
      type,
      onDisabledPress,
      onPress
    } = this.props
    const { pressed } = this.state
    let backgroundColor, borderColor, color

    switch (type) {
      case 'primary':
        backgroundColor = outline ? 'transparent' : '#1a82ff'
        borderColor = '#1a82ff'
        color = outline ? '#1a82ff' : 'white'
        break
      case 'link':
        backgroundColor = 'transparent'
        borderColor = 'transparent'
        color = '#1a82ff'
        break
      case 'error':
        backgroundColor = outline ? 'transparent' : '#ff0000'
        borderColor = '#ff0000'
        color = outline ? '#ff0000' : 'white'
        break
    }

    return (
      <TouchableOpacity
        activeOpacity={disabled || pressed ? 1 : 0.5}
        onPress={() => {
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
        }}
        style={{ width: size === 'large' ? '100%' : undefined }}
      >
        <View
          style={[
            {
              backgroundColor,
              borderColor,
              opacity: disabled || pressed ? 0.2 : 1
            },
            styles[size] || styles.small,
            styles.button,
            style
          ]}
        >
          {!loading && (
            <>
              <Text style={[{ color }, styles.buttonText, textStyle]}>
                {title}
              </Text>
              {image && <View style={styles.image}>{image}</View>}
            </>
          )}
          {loading && <ActivityIndicator color={color} />}
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
    marginBottom: 10,
    marginHorizontal: 20
  },
  buttonText: {
    fontFamily: 'Lato',
    fontSize: smallScreen ? 16 : 18,
    fontWeight: smallScreen ? '600' : '900',
    textAlign: 'center'
  },
  image: {
    marginLeft: 10
  },
  large: {
    borderRadius: 25,
    height: smallScreen ? 40 : 50
  },
  small: {
    borderRadius: 15,
    height: smallScreen ? 20 : 30
  }
})
