import React, { Component } from 'react'
import { Alert, Text, TouchableOpacity } from 'react-native'

import { evenlySplitAddress, truncateAddress } from 'utils/user'

export default class Address extends Component {
  render() {
    const { address, label, style, onPress } = this.props

    return (
      <TouchableOpacity onPress={() => {
        if (typeof onPress === 'function') {
          onPress()
        } else {
          Alert.alert(label, evenlySplitAddress(address).join('\n'))
        }
      }}>
        <Text style={style}>{truncateAddress(address)}</Text>
      </TouchableOpacity>
    )
  }
}