'use strict'

import React from 'react'
import { ActivityIndicator, View } from 'react-native'

const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color="white" />
  </View>
)

const styles = {
  loading: {
    backgroundColor: '#293f55',
    flex: 1,
    justifyContent: 'space-around'
  }
}

export default Loading
