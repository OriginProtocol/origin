'use strict'

import React, { Component } from 'react'
import { Alert, Clipboard, Text, TouchableOpacity } from 'react-native'
import { fbt } from 'fbt-runtime'

import { evenlySplitAddress, truncateAddress } from 'utils/user'

export default class Address extends Component {
  render() {
    const { address, chars, label, style, onPress } = this.props

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.5 : 1}
        onPress={() => {
          if (typeof onPress === 'function') {
            onPress()
          } else {
            Alert.alert(label, evenlySplitAddress(address).join('\n'), [
              {
                text: fbt('Copy', 'Address.alertCopyButton'),
                onPress: async () => {
                  await Clipboard.setString(address)
                  Alert.alert(
                    fbt('Copied to clipboard!', 'Address.alertSuccess')
                  )
                }
              },
              { text: fbt('OK', 'Address.alertOkButton') }
            ])
          }
        }}
      >
        <Text style={style}>{truncateAddress(address, chars)}</Text>
      </TouchableOpacity>
    )
  }
}
