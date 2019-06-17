'use strict'

import React from 'react'
import { StyleSheet, View } from 'react-native'

const Separator = ({ padded }) => {
  /* eslint-disable-next-line no-extra-semi */
  ;<View style={styles.container}>
    {padded && <View style={styles.space} />}
    <View style={styles.line} />
  </View>
}

export default Separator

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 1
  },
  line: {
    backgroundColor: '#c8c7cc',
    flex: 1,
    height: 1
  },
  space: {
    backgroundColor: 'white',
    height: 1,
    width: '5%'
  }
})
