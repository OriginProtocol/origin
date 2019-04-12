'use strict'

import React, { Component, Fragment } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Separator,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import { connect } from 'react-redux'

import { setNetwork } from 'actions/Settings'
import { NETWORKS } from '../constants'

const IMAGES_PATH = '../../assets/images/'

class SettingsScreen extends Component {
  static navigationOptions = {
    title: 'Settings',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  }

  handleSetNetwork(network) {
    this.props.setNetwork(network)
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.heading}>GENERAL</Text>
          </View>
          <TouchableHighlight
            onPress={() => this.props.navigation.navigate('Accounts')}
          >
            <View style={styles.item}>
              <Text style={styles.text}>Accounts</Text>
              <View style={styles.iconContainer}>
                <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
              </View>
            </View>
          </TouchableHighlight>
          <View style={styles.header}>
            <Text style={styles.heading}>NETWORK</Text>
          </View>
          {NETWORKS.map((network, i) => (
            <Fragment key={network.id}>
              <TouchableHighlight onPress={() => this.handleSetNetwork(network)}>
                <View style={styles.item}>
                  <Text style={styles.text}>{network.name}</Text>
                  <View style={styles.iconContainer}>
                    {network.id === this.props.settings.network.id && (
                      <Image
                        source={require(`${IMAGES_PATH}selected.png`)}
                        style={styles.image}
                      />
                    )}
                    {network.id !== this.props.settings.network.id && (
                      <Image
                        source={require(`${IMAGES_PATH}deselected.png`)}
                        style={styles.image}
                      />
                    )}
                  </View>
                </View>
              </TouchableHighlight>
            </Fragment>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: network => dispatch(setNetwork(network)),
})

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1
  },
  content: {
    paddingBottom: 20
  },
  header: {
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 30
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5
  },
  iconContainer: {
    height: 17,
    justifyContent: 'center'
  },
  image: {
    height: 24,
    width: 24
  },
  input: {
    backgroundColor: 'white',
    fontFamily: 'Lato',
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: '5%'
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%'
  },
  keyboardWrapper: {
    flex: 1
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato'
  }
})
