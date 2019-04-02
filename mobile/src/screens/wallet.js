'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

class WalletScreen extends Component {
  static navigationOptions = {
    title: 'Wallet',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }

  componentDidMount() {}

  render() {
    return (
      <View style={styles.wrapper}>
        <View contentContainerStyle={styles.content} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>NAME</Text>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {}
}

export default connect(mapStateToProps)(WalletScreen)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  list: {
    backgroundColor: '#f7f8f8',
    height: '100%'
  },
  placeholder: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center'
  },
  separator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%'
  }
})
