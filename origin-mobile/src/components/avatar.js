import React, { Component } from 'react'
import { Image, StyleSheet, View } from 'react-native'

const IMAGES_PATH = '../../assets/images/'

export default class Avatar extends Component {
  render() {
    const { size, style } = this.props

    return (
      <View style={[styles.container, { height: size, paddingTop: size / 10, width: size }, style]}>
        <Image
          source={require(`${IMAGES_PATH}avatar.png`)}
          resizeMethod={'resize'}
          resizeMode={'contain'}
          style={styles.image}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e3f53',
    borderRadius: 5,
    alignItems: 'center',
  },
  image: {
    flex: 1,
  },
})
