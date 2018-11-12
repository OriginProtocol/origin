import React, { Component } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'
import originWallet from '../OriginWallet'
import { setActiveEvent } from 'actions/WalletEvents'

import DeviceItem from '../components/device-item'
import Separator from '../components/separator'
import TransactionItem from '../components/transaction-item'
import TransactionModal from '../components/transaction-modal'
import SignItem from '../components/sign-item'
import SignModal from '../components/sign-modal'
import DeviceModal from '../components/device-modal'


class AlertsScreen extends Component {
  constructor(props) {
    super(props)

    this.toggleModal = this.toggleModal.bind(this)
    this.state = {
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
    this.props.setActiveEvent(null)
  }

  async acceptItem(item){
    let done = await originWallet.handleEvent(item)
    if (done)
    {
      this.toggleModal()
    }
  }

  rejectItem(item){
    originWallet.handleReject(item)
    this.toggleModal()
  }

  render() {
    const balance = this.props.balance
    const myAddress = this.props.address
    const selectedItem = this.props.active_event

    return (
      <View>
        <FlatList
          data={this.props.events}
          renderItem={({item}) => {
            switch(item.action) {
              case 'transaction':
                return (
                  <TransactionItem
                    item={item}
                    address ={myAddress}
                    balance ={balance}
                    handleApprove={() => originWallet.handleEvent(item) }
                    handlePress={() => this.props.setActiveEvent( item )}
                    handleReject={() => originWallet.handleReject(item) }
                  />
                )
              case 'link':
                return (
                  <DeviceItem
                    item={item}
                    handleLink={() => originWallet.handleEvent(item)}
                    handleReject={() => originWallet.handleReject(item)}
                  />
                )
              case 'sign':
                return (
                  <SignItem
                  item={item}
                  address ={myAddress}
                  balance ={balance}
                  handleApprove={() => originWallet.handleEvent(item) }
                  handlePress={() => this.props.setActiveEvent( item )}
                  handleReject={() => originWallet.handleReject(item) }
                  />
                )
              default:
                return null
            }
          }}
          keyExtractor={(item, index) => item.event_id}
          ItemSeparatorComponent={() => (<Separator />)}
          style={styles.list}
        />
        {selectedItem &&
          selectedItem.transaction &&
          myAddress &&
          <TransactionModal
            item={selectedItem}
            address ={myAddress}
            balance ={balance}
            handleApprove={() => this.acceptItem(selectedItem)}
            handleReject={() => this.rejectItem(selectedItem)}
            toggleModal={this.toggleModal}
          />}
        {selectedItem &&
          selectedItem.sign &&
          myAddress &&
          <SignModal
            item={selectedItem}
            address ={myAddress}
            balance ={balance}
            handleApprove={() => this.acceptItem(selectedItem)}
            handleReject={() => this.rejectItem(selectedItem)}
            toggleModal={this.toggleModal}
          />}
        {selectedItem &&
          selectedItem.link &&
          myAddress &&
          <DeviceModal
            item={selectedItem}
            address ={myAddress}
            balance ={balance}
            handleApprove={() => this.acceptItem(selectedItem)}
            handleReject={() => this.rejectItem(selectedItem)}
            toggleModal={this.toggleModal}
          />}
      </View>
    )
  }
}
const mapDispatchToProps = dispatch => ({
  setActiveEvent:(event) => dispatch(setActiveEvent(event))
})

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    address: state.wallet.address,
    events: state.wallet_events.events,
    active_event: state.wallet_events.active_event
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertsScreen)


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
