import React, { Component } from 'react'
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import Currency from '../components/currency'
import Identicon from '../components/identicon'
import DeviceItem from '../components/device-item'
import Separator from '../components/separator'
import SignItem from '../components/sign-item'
import TransactionItem from '../components/transaction-item'

import originWallet from '../OriginWallet'

class HomeScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      recentItems: []
    }
  }

  static navigationOptions = {
    title: 'Home',
    headerTitle: () => (
      <Image source={require('../../assets/images/origin-logo.png')} />
    ),
  }

  render() {
    const myAddress = this.props.address 
    const ethBalance = web3.utils.fromWei(this.props.balance, 'ether')
    const balance = this.props.balance

    return (
      <View style={styles.container}>
        <ScrollView
          horizontal={true}
          style={styles.svContainer}
          contentContainerStyle={styles.walletContainer}
        >
          <Currency
            abbreviation={'ETH'}
            balance={ethBalance}
            labelColor={'#a27cff'}
            imageSource={require('../../assets/images/eth-icon.png')}
          />
          <Currency
            abbreviation={'OGN'}
            balance={'0'}
            labelColor={'#007fff'}
            imageSource={require('../../assets/images/eth-icon.png')}
          />
          <Currency
            abbreviation={'DAI'}
            balance={'0'}
            labelColor={'#fdb134'}
            imageSource={require('../../assets/images/eth-icon.png')}
          />
        </ScrollView>
        <View style={styles.oldWalletContainer}>
          {myAddress && <Identicon address={myAddress} style={styles.identicon} />}
          <Text style={styles.address}>{myAddress}</Text>
        </View>
        <FlatList
          data={this.props.processed_events}
          renderItem={({item}) => {
            console.log("Event item:", item)
            switch(item.action) {
              case 'transaction':
                return (
                  <TransactionItem item={item} 
                    address ={myAddress}
                    balance ={balance}
                  />
                )
              case 'sign':
                return (
                  <SignItem item={item} 
                    address ={myAddress}
                    balance ={balance}
                  />
                )
              case 'link':
                return (
                  <DeviceItem item={item}
                    address ={myAddress}
                    balance ={balance}
                    handleUnlink = {() => originWallet.handleUnlink(item)}/>
                )
              default:
                return null
            }
          }}
          keyExtractor={(item, index) => item.event_id}
          ItemSeparatorComponent={() => (<Separator />)}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerText}>RECENT ACTIVITY</Text>
            </View>
          )}
          style={styles.list}
        />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    address: state.wallet.address,
    processed_events: state.wallet_events.processed_events
  }
}

export default connect(mapStateToProps)(HomeScreen)

const styles = StyleSheet.create({
  address: {
    color: '#3e5d77',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 10,
    textAlign: 'center',
    width: '66%',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#f8fafa',
    borderColor: '#c8c7cc',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 24,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  headerText: {
    color: '#94a7b5',
    fontFamily: 'Poppins',
    fontSize: 13,
  },
  icon: {
    marginRight: 10,
  },
  identicon: {
    marginBottom: 20,
  },
  list: {
    backgroundColor: '#f7f8f8',
    flex: 1,
  },
  svContainer: {
    backgroundColor: '#0b1823',
    flexGrow: 0,
    height: 76,
  },
  text: {
    fontFamily: 'Lato',
    fontSize: 17,
  },
  walletContainer: {
    paddingLeft: 10,
    paddingVertical: 10,
  },
  oldWalletContainer: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    padding: 30,
  },
})
