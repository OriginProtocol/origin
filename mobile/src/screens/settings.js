import React, { Component, Fragment } from 'react'
import { Alert, FlatList, Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'

import Separator from 'components/separator'

import networks, { getCurrentNetwork } from 'utils/networks'

import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class SettingsScreen extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleNetwork = this.handleNetwork.bind(this)
    this.state = {
      apiHost: originWallet.getCurrentRemoteLocal()
    }
  }

  static navigationOptions = {
    title: 'Settings',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }

  handleNetwork(network) {
    this.setApiHost(network.url)
  }

  handleChange(apiHost) {
    this.setState({ apiHost })
  }

  async setApiHost(host) {
    try {
      await originWallet.setRemoteLocal(host)

      Alert.alert('Linking server host changed!')
    } catch(error) {
      Alert.alert('Linking server host change failed!')
      console.error(error)
    }
    
    this.setState({apiHost: originWallet.getCurrentRemoteLocal()})
  }

  handleSubmit(e) {
    this.setApiHost(e.nativeEvent.text)
  }

  render() {
    const { user } = this.props
    const { apiHost } = this.state
    const currentNetwork = getCurrentNetwork(apiHost)
    const isCustom = currentNetwork.custom

    return (
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>GENERAL</Text>
          </View>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('Accounts')}>
            <View style={styles.item}>
              <Text style={styles.text}>Accounts</Text>
              <View style={styles.iconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
              </View>
            </View>
          </TouchableHighlight>
          <Separator padded={true} />
          <TouchableHighlight onPress={() => this.props.navigation.navigate('Devices')}>
            <View style={styles.item}>
              <Text style={styles.text}>Devices</Text>
              <View style={styles.iconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
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
                    {n === currentNetwork &&
                      <Image source={require(`${IMAGES_PATH}selected.png`)} style={styles.image} />
                    }
                    {n !== currentNetwork &&
                      <Image source={require(`${IMAGES_PATH}deselected.png`)} style={styles.image} />
                    }
                  </View>
                </View>
              </TouchableHighlight>
              {(i + 1) < networks.length &&
                <Separator padded={true} />
              }
            </Fragment>
          ))}
          {isCustom &&
            <Fragment>
              <View style={styles.header}>
                <Text style={styles.heading}>LINKING SERVER HOST</Text>
              </View>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={this.handleChange}
                onSubmitEditing={e =>this.handleSubmit(e)}
                value={this.state.apiHost}
                style={styles.input}
              />
            </Fragment>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = ({ users, wallet }) => {
  return {
    user: users.find(({ address }) => address === wallet.address) || { address: wallet.address },
  }
}

export default connect(mapStateToProps)(SettingsScreen)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
  },
  content: {
    paddingBottom: 20,
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
  input: {
    backgroundColor: 'white',
    fontFamily: 'Lato',
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: '5%',
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%',
  },
  keyboardWrapper: {
    flex: 1,
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato',
  },
})
