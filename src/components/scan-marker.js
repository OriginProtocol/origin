import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

export default class ScanMarker extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={[ styles.corner, { borderLeftWidth: 2, borderTopWidth: 2 } ]}></View>
          <View style={[ styles.corner, { borderRightWidth: 2, borderTopWidth: 2 } ]}></View>
        </View>
        <View style={styles.row}>
          <View style={[ styles.corner, { borderBottomWidth: 2, borderLeftWidth: 2 } ]}></View>
          <View style={[ styles.corner, { borderBottomWidth: 2, borderRightWidth: 2 } ]}></View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    height: 324,
    width: 324,
  },
  corner: {
    borderColor: 'white',
    height: 37,
    width: 37,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
