import React, { Component } from 'react'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import DeviceItem from 'components/device-item'

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

  componentDidMount() {
    this.refreshList()
  }

  refreshList() {
    originWallet.getDevices()
  }

  render() {
    const { devices } = this.props

    return devices.length ? (
      <FlatList
        data={devices}
        renderItem={({ item }) => (
          <DeviceItem
            item={item}
            handleUnlink={() => originWallet.handleUnlink(item)}
          />
        )}
        keyExtractor={(item, index) => item.event_id}
        ItemSeparatorComponent={({ highlighted }) => (
          <View style={styles.separator} />
        )}
        style={styles.list}
      />
    ) : (
      <View style={styles.container}>
        <Text style={styles.placeholder}>No Devices Linked</Text>
      </View>
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
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  list: {
    backgroundColor: '#f7f8f8',
    height: '100%',
  },
  placeholder: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5,
    textAlign: 'center',
  },
  separator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%',
  },
})
