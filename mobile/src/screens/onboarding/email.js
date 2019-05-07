'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import { setEmail } from 'actions/Settings'

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

    if (this.props.settings.email && this.props.settings.email.length > 0) {
      this.props.navigation.navigate('Authentication')
    }
  }

  handleChange(emailValue) {
    this.setState({ emailValue: emailValue.trim() })
  }

  handleSubmit() {
    // Naive/simple email regex but should catch most issues
    const emailPattern = /.+@.+\..+/
    if (emailPattern.test(this.state.emailValue)) {
      this.props.setEmail(this.state.emailValue)
    } else {
      this.setState({ emailError: 'That does not look like a valid email.' })
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Let&apos;s Get Started</Text>
          <Text style={styles.subtitle}>What&apos;s your email address?</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            onChangeText={this.handleChange}
            onSubmitEditing={this.handleSubmit}
            value={this.state.emailValue}
            style={[styles.input, this.state.emailError ? styles.invalid : {}]}
          />
          {this.state.emailError.length > 0 && (
            <Text style={styles.invalid}>{this.state.emailError}</Text>
          )}
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>
            We will use your email to notify you of important notifications when
            you buy or sell.
          </Text>
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setEmail: email => dispatch(setEmail(email))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailScreen)

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
    width: '80%'
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
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
