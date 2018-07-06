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
          // objects here should all be linked: true
          {
            key: 'foo',
            deviceId: 'JgC55UUqEs',
            timestamp: '2018-06-01T04:48-0700',
            linked: true,
            link: {
              app_info: {
                browser: 'chrome',
                platform: 'desktop',
                language: 'en',
              },
            },
          },
          {
            key: 'bar',
            deviceId: 'GjF43HSuWf',
            timestamp: new Date(),
            linked: true,
            link: {
              app_info: {
                'user-agent': 'some-user-agent?',
                browser: 'unknown',
                platform: 'mobile',
                language: 'ko',
              },
            },
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
