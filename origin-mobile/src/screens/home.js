import React, { Component, Fragment } from 'react'
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import { setActiveEvent } from 'actions/WalletEvents'

import Currency from '../components/currency'
import DeviceItem from '../components/device-item'
import DeviceModal from '../components/device-modal'
import Separator from '../components/separator'
import SignItem from '../components/sign-item'
import SignModal from '../components/sign-modal'
import TransactionItem from '../components/transaction-item'
import TransactionModal from '../components/transaction-modal'

import originWallet from '../OriginWallet'

class HomeScreen extends Component {
  constructor(props) {
    super(props)

    this.toggleModal = this.toggleModal.bind(this)
    this.state = {
      recentItems: []
    }
  }

  static navigationOptions = {
    title: 'Home',
    headerTitle: () => (
      <Image source={require('../../assets/images/origin-logo-dark.png')} />
    ),
  }

  async acceptItem(item){
    const done = await originWallet.handleEvent(item)

    if (done) {
      this.toggleModal()
    }
  }

  rejectItem(item){
    originWallet.handleReject(item)

    this.toggleModal()
  }

  toggleModal() {
    this.props.setActiveEvent(null)
  }

  render() {
    const { active_event, address, balance, pending_events, processed_events } = this.props
    const ethBalance = web3.utils.fromWei(balance, 'ether')

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
            imageSource={require('../../assets/images/ogn-icon.png')}
          />
          <Currency
            abbreviation={'DAI'}
            balance={'0'}
            labelColor={'#fdb134'}
            imageSource={require('../../assets/images/ogn-icon.png')}
          />
        </ScrollView>
        {!!pending_events.length &&
          <View style={styles.callsToAction}>
            <FlatList
              data={pending_events}
              renderItem={({ item }) => {
                switch(item.action) {
                  case 'transaction':
                    return (
                      <TransactionItem
                        item={item}
                        address={address}
                        balance={balance}
                        handleApprove={() => originWallet.handleEvent(item) }
                        handlePress={() => this.props.setActiveEvent(item)}
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
                      address={address}
                      balance={balance}
                      handleApprove={() => originWallet.handleEvent(item) }
                      handlePress={() => this.props.setActiveEvent(item)}
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
            {active_event &&
              active_event.transaction &&
              address &&
              <TransactionModal
                item={active_event}
                address={address}
                balance={balance}
                handleApprove={() => this.acceptItem(active_event)}
                handleReject={() => this.rejectItem(active_event)}
                toggleModal={this.toggleModal}
              />
            }
            {active_event &&
              active_event.sign &&
              address &&
              <SignModal
                item={active_event}
                address={address}
                balance={balance}
                handleApprove={() => this.acceptItem(active_event)}
                handleReject={() => this.rejectItem(active_event)}
                toggleModal={this.toggleModal}
              />
            }
            {active_event &&
              active_event.link &&
              address &&
              <DeviceModal
                item={active_event}
                address={address}
                balance={balance}
                handleApprove={() => this.acceptItem(active_event)}
                handleReject={() => this.rejectItem(active_event)}
                toggleModal={this.toggleModal}
              />
            }
          </View>
        }
        {!!processed_events.length &&
          <Fragment>
            <View style={styles.header}>
              <Text style={styles.headerText}>RECENT ACTIVITY</Text>
            </View>
            <FlatList
              data={processed_events}
              renderItem={({item}) => {
                console.log("Event item:", item)
                switch(item.action) {
                  case 'transaction':
                    return (
                      <TransactionItem item={item} 
                        address ={address}
                        balance ={balance}
                      />
                    )
                  case 'sign':
                    return (
                      <SignItem item={item} 
                        address ={address}
                        balance ={balance}
                      />
                    )
                  case 'link':
                    return (
                      <DeviceItem item={item}
                        address ={address}
                        balance ={balance}
                        handleUnlink = {() => originWallet.handleUnlink(item)}/>
                    )
                  default:
                    return null
                }
              }}
              keyExtractor={(item, index) => item.event_id}
              ItemSeparatorComponent={() => (<Separator />)}
              style={styles.alertslist}
            />
          </Fragment>
        }
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    active_event: state.wallet_events.active_event,
    address: state.wallet.address,
    balance: state.wallet.balance,
    pending_events: state.wallet_events.pending_events,
    processed_events: state.wallet_events.processed_events,
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveEvent: event => dispatch(setActiveEvent(event))
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  callsToAction: {
    flexGrow: 1,
    height: 100,
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
    fontSize: 10,
  },
  icon: {
    marginRight: 10,
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
})
