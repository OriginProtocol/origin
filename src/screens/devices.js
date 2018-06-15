import React, { Component } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'

import DeviceItem from '../components/device-item'

export default class DevicesScreen extends Component {
  static navigationOptions = {
    title: 'Devices',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  render() {
    return (
      <FlatList
        data={[
          {
            key: 'foo',
            deviceId: 'JgC55UUqEs',
            deviceType: 'Chrome',
            timestamp: '2018-06-01T04:48-0700',
          },
          {
            key: 'bar',
            deviceId: 'GjF43HSuWf',
            deviceType: 'Unknown',
            timestamp: new Date(),
          },
        ]}
        renderItem={({item}) => (
          <DeviceItem
            item={item}
            handleUnlink={() => Alert.alert('To Do', 'handle unlink')}
          />
        )}
        ItemSeparatorComponent={({highlighted}) => (
          <View style={styles.separator} />
        )}
        style={styles.list}
      />
    )
  }
}

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
