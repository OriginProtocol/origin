'use strict'

import React, { Component } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import { connect } from 'react-redux'

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
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(SettingsScreen)

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
