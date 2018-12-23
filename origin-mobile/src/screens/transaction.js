import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications } from 'actions/Activation'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

class TransactionScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Transaction',
    headerTitleStyle : {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  })

  render() {
    return (
      <View style={styles.container}>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    address: state.wallet.address,
    balances: state.wallet.balances,
  }
}

export default connect(mapStateToProps)(TransactionScreen)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingVertical: '5%',
  },
})
