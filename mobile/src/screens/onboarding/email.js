'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import AccountModal from 'components/account-modal'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

class EmailScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailValue: '',
      emailError: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidUpdate() {
    const { emailError, emailValue } = this.state

    if (emailError && !emailValue) {
      this.setState({ emailError: '' })
    }
  }

  handleChange(emailValue) {
    this.setState({ emailValue: emailValue.trim() })
  }

  handleSubmit() {
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Let's Get Started</Text>
          <Text style={styles.subtitle}>What's your email address?</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            onChangeText={this.handleChange}
            onSubmitEditing={this.handleSubmit}
            value={this.state.emailValue}
            style={styles.input}
          />
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>We will use your email to notify you of important notifications when you buy or sell.</Text>
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(EmailScreen)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  legalContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    width: "80%",
  },
  legal: {
    textAlign: 'center',
    color: '#98a7b4'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300
  }
})
