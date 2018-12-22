import React, { Component } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

class WalletFundingScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.currency.toUpperCase()} Balance`,
    headerTitleStyle : {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  })

  render() {
    const { address, balances, navigation: { currency } } = this.props

    return (
      <View style={styles.container}>
        <Text style={{ ...styles.heading, color: colorMap[currency] }}>
          {currency.toUpperCase()}
        </Text>
        <OriginButton
          size="large"
          type="primary"
          style={styles.button}
          textStyle={{ fontSize: 18, fontWeight: '900' }}
          title={'Done'}
          onPress={() => {
            Alert.alert('done')
          }}
        />
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

export default connect(mapStateToProps)(WalletFundingScreen)

const styles = StyleSheet.create({
  button: {
    marginTop: 'auto',
  },
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    paddingHorizontal: '10%',
    paddingVertical: '5%',
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
  },
})
