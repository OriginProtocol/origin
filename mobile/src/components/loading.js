'use strict'

import React from 'react'
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  View
} from 'react-native'

const IMAGES_PATH = '../../assets/images/'

const Loading = props => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Image source={require(IMAGES_PATH + 'origin-white-logo.png')} />
    </View>
    <View style={styles.indicatorContainer}>
      <ActivityIndicator size="small" color="white" />
      {props.text && <Text style={styles.indicatorText}>{props.text}</Text>}
    </View>
  </SafeAreaView>
)

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#007fff'
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%'
  },
  indicatorContainer: {
    marginBottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicatorText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
}

export default Loading
