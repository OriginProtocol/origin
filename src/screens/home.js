import React, { Component } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'

import Identicon from '../components/identicon'
import DeviceItem from '../components/device-item'
import Separator from '../components/separator'
import TransactionItem from '../components/transaction-item'

export default class HomeScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedItem: null,
    }
  }

  static navigationOptions = {
    title: 'Home',
    headerTitle: () => (
      <Image source={require('../../assets/images/origin-logo.png')} />
    ),
  }

  render() {
    const myAddress = '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR'
    const ethBalance = '0.717346'

    return (
      <View style={styles.container}>
        <View style={styles.walletContainer}>
          <Identicon address={myAddress} style={styles.identicon} />
          <Text style={styles.address}>{myAddress}</Text>
          <View style={styles.balance}>
            <Image source={require('../../assets/images/eth-icon.png')} style={styles.icon} />
            <Text>{ethBalance} ETH</Text>
          </View>
        </View>
        <FlatList
          data={[
            {
              key: 'foo',
              actionName: 'Purchase',
              listingName: 'Mamalahoa Estate',
              listingPhoto: require('../../assets/images/listing-photo-1.jpeg'),
              fromAddress: '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR',
              toAddress: '0x34Be343B94f860124dC4fEe278FDCBD38C102BAZ',
            },
            {
              key: 'bar',
              actionName: 'Purchase',
              listingName: 'Zinc House',
              listingPhoto: require('../../assets/images/listing-photo-2.jpeg'),
              fromAddress: '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR',
              toAddress: '0x34Be343B94f860124dC4fEe278FDCBD38C102BAZ',
            },
            {
              key: 'baz',
              actionName: 'Link',
              deviceId: 'JgC55UUqEs',
              deviceType: 'Chrome',
              timestamp: '2018-06-01T04:48-0700',
            },
            {
              key: 'qux',
              actionName: 'Link',
              deviceId: 'GjF43HSuWf',
              deviceType: 'Unknown',
              timestamp: new Date(),
            },
          ]}
          renderItem={({item}) => {
            switch(item.actionName) {
              case 'Purchase':
                return (
                  <TransactionItem item={item} />
                )
              case 'Link':
                return (
                  <DeviceItem item={item} />
                )
              default:
                return null
            }
          }}
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

const styles = StyleSheet.create({
  address: {
    color: '#3e5d77',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 10,
    textAlign: 'center',
    width: '66%',
  },
  balance: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  text: {
    fontFamily: 'Lato',
    fontSize: 17,
  },
  walletContainer: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    padding: 30,
  },
})
