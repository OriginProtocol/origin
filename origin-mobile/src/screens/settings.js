import React, { Component, Fragment } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'

import Separator from 'components/separator'

import networks from 'utils/networks'

import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class SettingsScreen extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    // this.handleNetwork = this.handleNetwork.bind(this)
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

  // handleNetwork({ id, name }) {
  //   const { networkId = 999 } = this.props

  //   if (id === networkId) {
  //     return
  //   }

  //   Alert.alert(`${name} is not yet supported.`)
  // }

  handleChange(apiHost) {
    this.setState({ apiHost })
  }

  async handleSubmit(e) {
    try {
      await originWallet.setRemoteLocal(e.nativeEvent.text)

      Alert.alert('Linking server host changed!')
    } catch(error) {
      Alert.alert('Linking server host change failed!')

      console.error(error)
    }
  }

  render() {
    const { networkId = 999, user } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>GENERAL</Text>
        </View>
        <TouchableHighlight onPress={() => this.props.navigation.navigate('Devices')}>
          <View style={styles.item}>
            <Text style={styles.text}>Devices</Text>
            <View style={styles.iconContainer}>
              <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
            </View>
          </View>
        </TouchableHighlight>
        <Separator padded={true} />
        <TouchableHighlight onPress={() => this.props.navigation.navigate('Profile', { user })}>
          <View style={styles.item}>
            <Text style={styles.text}>Profile</Text>
            <View style={styles.iconContainer}>
              <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
            </View>
          </View>
        </TouchableHighlight>
        {originWallet.isLocalApi() &&
          <Fragment>
            <View style={styles.header}>
              <Text style={styles.heading}>LINKING SERVER HOST</Text>
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.handleChange}
              onSubmitEditing={this.handleSubmit}
              value={this.state.apiHost}
              style={styles.input}
            />
          </Fragment>
        }
        {originWallet.isLocalApi() &&
          <Fragment>
              <View style={styles.header}>
                <Text style={styles.heading}>SET PRIVATE KEY</Text>
              </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={async (e) => { if (await originWallet.setPrivateKey(e.nativeEvent.text)) {
                  Alert.alert('A new private key has been set!')
                }}}
              onChangeText={(inputPrivateKey) => this.setState({inputPrivateKey})}
              value={this.state.inputPrivateKey}
              style={styles.input}
            />
          </Fragment>
          /* Don't offer toggleable networks yet

            networks.map((n, i) => (
              <Fragment key={n.id}>
                <TouchableHighlight onPress={() => this.handleNetwork(n)}>
                  <View style={styles.item}>
                    <Text style={styles.text}>{n.name}</Text>
                    <View style={styles.iconContainer}>
                      {n.id === networkId &&
                        <Image source={require(`${IMAGES_PATH}selected.png`)} style={styles.image} />
                      }
                      {n.id !== networkId &&
                        <Image source={require(`${IMAGES_PATH}deselected.png`)} style={styles.image} />
                      }
                    </View>
                  </View>
                </TouchableHighlight>
                {(i + 1) < networks.length &&
                  <Separator padded={true} />
                }
              </Fragment>
            ))

          */
        }
      </View>
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
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato',
  },
})
