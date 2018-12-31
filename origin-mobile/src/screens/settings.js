import React, { Component } from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Separator from 'components/separator'

export default class SettingsScreen extends Component {
  static navigationOptions = {
    title: 'Settings',
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
            key: 'Wallet',
          },
          {
            key: 'Devices',
          },
        ]}
        renderItem={({item}) => (
          <TouchableHighlight onPress={() => this.props.navigation.navigate(item.key)}>
            <View style={styles.item}>
              <Text style={styles.text}>{item.key}</Text>
              <View style={styles.iconContainer}>
                <Image source={require('../../assets/images/arrow-right.png')} />
              </View>
            </View>
          </TouchableHighlight>
        )}
        ItemSeparatorComponent={() => (<Separator />)}
        style={styles.list}
      />
    )
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    height: 17,
    justifyContent: 'center',
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%',
  },
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
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato',
  },
})
