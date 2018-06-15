import React, { Component } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import DeviceItem from '../components/device-item'
import Separator from '../components/separator'
import TransactionItem from '../components/transaction-item'
import TransactionModal from '../components/transaction-modal'

export default class AlertsScreen extends Component {
  constructor(props) {
    super(props)

    this.toggleModal = this.toggleModal.bind(this)
    this.state = {
      selectedItem: null,
    }
  }

  static navigationOptions = {
    title: 'Alerts',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  toggleModal() {
    this.setState({ selectedItem: null })
  }

  render() {
    const hasSufficientFunds = true
    const myAddress = '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR'

    return (
      <View>
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
              deviceId: 'JgC55UUquEs',
              deviceType: 'Chrome',
            }
          ]}
          renderItem={({item}) => {
            switch(item.actionName) {
              case 'Purchase':
                return (
                  <TransactionItem
                    item={item}
                    handleApprove={() => Alert.alert('To Do', 'handle approve')}
                    handlePress={() => this.setState({ selectedItem: item })}
                    handleReject={() => Alert.alert('To Do', 'handle reject')}
                  />
                )
              case 'Link':
                return (
                  <DeviceItem
                    item={item}
                    handleLink={() => Alert.alert('To Do', 'handle link')}
                    handleReject={() => Alert.alert('To Do', 'handle no thanks')}
                  />
                )
              default:
                return null
            }
          }}
          ItemSeparatorComponent={() => (<Separator />)}
          ListHeaderComponent={hasSufficientFunds ? null : () => (
            <TouchableHighlight onPress={() => Alert.alert('To Do', 'handle funding')}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Image source={require('../../assets/images/wallet.png')} style={styles.icon} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[ styles.text, { fontWeight: '300', marginBottom: '5%' } ]}>
                    You have no funds in your wallet. Add funds to complete purchases.
                  </Text>
                  <Text style={styles.text}>
                    {myAddress}
                  </Text>
                </View>
              </View>
            </TouchableHighlight>
          )}
          style={styles.list}
        />
        <TransactionModal
          item={this.state.selectedItem}
          handleApprove={() => Alert.alert('To Do', 'handle approve')}
          handleReject={() => Alert.alert('To Do', 'handle reject')}
          toggleModal={this.toggleModal}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#293f55',
    flex: 1,
    flexDirection: 'row',
    padding: '5%',
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
    width: 30,
  },
  iconContainer: {
    marginRight: '5%',
  },
  list: {
    backgroundColor: '#f7f8f8',
    height: '100%',
  },
  text: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 17
  },
  textContainer: {
    flex: 1,
  },
})
