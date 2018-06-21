import React, { Component } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'
import originWallet from '../OriginWallet'

import DeviceItem from '../components/device-item'
import Separator from '../components/separator'
import TransactionItem from '../components/transaction-item'
import TransactionModal from '../components/transaction-modal'


class AlertsScreen extends Component {
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

  componentDidMount() {
    this.processFromNavParams()
  }

  componentDidUpdate(prevProps) {
    if (this.props.navigation.state.params != prevProps.navigation.state.params)
    {
      this.processFromNavParams()
    }
  }

  async processFromNavParams(){
    const item = this.props.navigation.state.params
    if (item)
    {
      this.setState(state => {
        if (!state.selectedItem || originWallet.matchEvents(item, state.selectedItem)) {
          state.selectedItem = item
        }
        return state
      })
    }
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
    const selectedItem = this.state.selectedItem

    return (
      <View>
        <FlatList
          data={this.props.events}
          renderItem={({item}) => {
            switch(item.action) {
              case 'purchase':
              case 'list':
                return (
                  <TransactionItem
                    item={item}
                    address ={myAddress}
                    balance ={balance}
                    handleApprove={() => originWallet.handleEvent(item) }
                    handlePress={() => this.setState({ selectedItem: item })}
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
              default:
                return null
            }
          }}
          keyExtractor={(item, index) => item.event_id}
          ItemSeparatorComponent={() => (<Separator />)}
          style={styles.list}
        />
        {selectedItem &&
          selectedItem.listing &&
          <TransactionModal
            item={this.state.selectedItem}
            address ={myAddress}
            balance ={balance}
            handleApprove={() => this.acceptItem(this.state.selectedItem)}
            handleReject={() => this.rejectItem(this.state.selectedItem)}
            toggleModal={this.toggleModal}
          />}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    address: state.wallet.address,
    events: state.wallet_events.events
  }
}

export default connect(mapStateToProps)(AlertsScreen)


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
