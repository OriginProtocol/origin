import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

export default class Separator extends Component {
  render() {
    const { padded } = this.props

    return (
      <View style={styles.container}>
        {padded && <View style={styles.space} />}
        <View style={styles.line} />
      </View>
    )
  }
}

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
