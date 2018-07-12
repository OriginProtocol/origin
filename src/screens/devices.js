import React, { Component } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import DeviceItem from '../components/device-item'
import originWallet from '../OriginWallet'

class DevicesScreen extends Component {
  static navigationOptions = {
    title: 'Devices',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  componentDidMount(){
    this.refreshList()
  }

  refreshList(){
    originWallet.getDevices()
  }

  render() {
    return (
      <FlatList
        data={this.props.devices}
        renderItem={({item}) => (
          <DeviceItem
            item={item}
            handleUnlink={() => {originWallet.handleUnlink(item); this.refreshList()}}
          />
        )}
        keyExtractor={(item, index) => item.event_id}
        ItemSeparatorComponent={({highlighted}) => (
          <View style={styles.separator} />
        )}
        style={styles.list}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    devices: state.devices.devices
  }
}

export default connect(mapStateToProps)(DevicesScreen)

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#f7f8f8',
    height: '100%',
  },
  separator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%',
  },
})
