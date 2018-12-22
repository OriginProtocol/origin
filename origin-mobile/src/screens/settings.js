import React, { Component, Fragment } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Separator from 'components/separator'

const networks = [
  {
    id: '1',
    name: 'Mainnet',
  },
  {
    id: '4',
    name: 'Rinkeby',
  },
  {
    id: '999',
    name: 'Localhost',
  },
]

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props)

    this.handleNetwork = this.handleNetwork.bind(this)
  }

  static navigationOptions = {
    title: 'Settings',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  handleNetwork({ id, name }) {
    const { networkId = '999' } = this.props

    if (id === networkId) {
      return
    }

    Alert.alert(`${name} is not yet supported.`)
  }

  render() {
    const { networkId = '999' } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>GENERAL</Text>
        </View>
        <TouchableHighlight onPress={() => this.props.navigation.navigate('Devices')}>
          <View style={styles.item}>
            <Text style={styles.text}>Devices</Text>
            <View style={styles.iconContainer}>
              <Image source={require('../../assets/images/arrow-right.png')} />
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.header}>
          <Text style={styles.heading}>NETWORK</Text>
        </View>
        {networks.map((n, i) => (
          <Fragment key={n.id}>
            <TouchableHighlight onPress={() => this.handleNetwork(n)}>
              <View style={styles.item}>
                <Text style={styles.text}>{n.name}</Text>
                <View style={styles.iconContainer}>
                  {n.id === networkId &&
                    <Image source={require('../../assets/images/ogn-icon.png')} style={styles.image} />
                  }
                  {n.id !== networkId &&
                    <Image source={require('../../assets/images/eth-icon.png')} style={styles.image} />
                  }
                </View>
              </View>
            </TouchableHighlight>
            {(i + 1) < networks.length &&
              <Separator padded={true} />
            }
          </Fragment>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
  },
  header: {
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5,
  },
  iconContainer: {
    height: 17,
    justifyContent: 'center',
  },
  image: {
    height: 24,
    width: 24,
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%',
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato',
  },
})
