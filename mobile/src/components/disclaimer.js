'use strict'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Disclaimer = props => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.children}</Text>
  </View>
)

export default Disclaimer

const styles = StyleSheet.create({
  container: {
    fontSize: 14,
    paddingVertical: 10,
    width: '80%'
  },
  text: {
    textAlign: 'center',
    color: '#98a7b4',
    fontFamily: 'Lato'
  }
})
