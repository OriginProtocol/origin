'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import { remove } from 'actions/Notification'

class NotificationItem extends Component {
  render() {
    const { message } = this.props.item

    return (
      <View style={styles.item}>
        <View style={styles.content}>
          <View style={{ ...styles.thumbnail, ...styles.imageless }} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  remove: id => dispatch(remove(id))
})

export default connect(
  undefined,
  mapDispatchToProps
)(NotificationItem)

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    marginBottom: 10
  },
  external: {
    height: 12,
    width: 12
  },
  imageless: {
    backgroundColor: '#f7f8f8'
  },
  item: {
    backgroundColor: 'white',
    padding: '5%'
  },
  message: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300'
  },
  thumbnail: {
    height: 50,
    marginRight: 10,
    width: 50
  }
})
