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
      <Text style={styles.errorText}>{props.errorText}</Text>
    </View>
    <View style={styles.indicatorContainer}>
      {props.activityIndicator !== false &&
        <ActivityIndicator size="small" color="white" />
      }
      {props.loadingText && <Text style={styles.indicatorText}>{props.loadingText}</Text>}
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  errorText: {
    width: '80%',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20
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
