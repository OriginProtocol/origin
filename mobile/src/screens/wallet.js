'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { Query } from 'react-apollo'

import ProfileQuery from 'queries/Profile'
import TokenBalance from 'components/token-balance'
import Loading from 'components/loading'

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
      <Query query={ProfileQuery} pollInterval={1000}>
        {({ data, loading, error }) => {
          if (loading) {
            return <Text>Loading</Text>
          }

          if (error) {
            return <Text>An error occurred: {error}</Text>
          }

          const primaryAccount = data.web3.primaryAccount
          const { id, checksumAddress } = primaryAccount
          const ethBalance = primaryAccount.balance.eth

          return (
            <>
              <Text>Address: {id}</Text>
              <Text>ETH: {ethBalance}</Text>
              <Text>
                DAI: <TokenBalance account={checksumAddress} token="DAI" />
              </Text>
              <Text>
                OGN: <TokenBalance account={checksumAddress} token="OGN" />
              </Text>
            </>
          )
        }}
      </Query>
    )
  }
}

const mapStateToProps = state => {
  return {}
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
