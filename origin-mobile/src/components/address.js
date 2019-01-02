import React, { Component } from 'react'
import { Alert, Text, TouchableOpacity } from 'react-native'

import { evenlySplitAddress, truncateAddress } from 'utils/user'

export default class Address extends Component {
  render() {
    const { address, chars, label, style, onPress } = this.props

    return (
      <TouchableOpacity activeOpacity={onPress ? 0.5 : 1} onPress={() => {
        if (typeof onPress === 'function') {
          onPress()
        } else {
          Alert.alert(label, evenlySplitAddress(address).join('\n'))
        }
      }}>
        <Text style={style}>{truncateAddress(address, chars)}</Text>
      </TouchableOpacity>
    )
  }
}