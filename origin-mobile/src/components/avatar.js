import React, { Component } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

const IMAGES_PATH = '../../assets/images/'

export default class Avatar extends Component {
  render() {
    const { image, size, style, onPress } = this.props

    return (
      <TouchableOpacity activeOpacity={onPress ? 0.5 : 1} onPress={() => {
        if (typeof onPress === 'function') {
          onPress()
        }
      }}>
        <View style={[styles.container, { borderRadius: size / 8, height: size, paddingTop: size / 10, width: size }, style]}>
          <Image
            source={image ? { uri: image } : require(`${IMAGES_PATH}avatar.png`)}
            resizeMethod={'resize'}
            resizeMode={'contain'}
            style={[styles.image, { borderRadius: size / 8 }]}
          />
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e3f53',
    alignItems: 'center',
  },
  image: {
    // flex: 1,
    height: '100%',
    width: '100%',
  },
})
