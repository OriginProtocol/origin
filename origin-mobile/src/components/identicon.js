import React, { Component } from 'react'
import { Image, StyleSheet } from 'react-native'

import IdenticonJS from 'identicon.js'

export default class Identicon extends Component {
  render() {
    const size = this.props.size || 100
    const data = new IdenticonJS(this.props.address, size * 3).toString()
    const uri = `data:image/png;base64, ${data}`
    let styleTree = [styles.identicon]

    if (size) {
      styleTree.push({
        borderRadius: size / 2,
        height: size,
        width: size,
      })
    }

    return (
      <Image style={[...styleTree, this.props.style]} source={{ uri }} />
    )
  }
}

const styles = StyleSheet.create({
  identicon: {
    borderRadius: 75,
    height: 150,
    width: 150,
  },
})
