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
    const { wallet } = this.props
    const balances = wallet.accountBalanceMapping[wallet.activeAccount.address]

    return (
      <>
        <Text>Address: {wallet.activeAccount.address}</Text>
        {Object.keys(balances).map(token => {
          return (
            <Text key={token}>
              {token}: {balances[token]}
            </Text>
          )
        })}
      </>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(WalletScreen)

const styles = StyleSheet.create({
  header: {},
  heading: {},
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 20
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
