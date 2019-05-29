'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setEmail } from 'actions/Settings'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'

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

  handleChange(emailValue) {
    this.setState({ emailError: '', emailValue: emailValue.trim() })
  }

  async handleSubmit() {
    // Naive/simple email regex but should catch most issues
    const emailPattern = /.+@.+\..+/
    if (emailPattern.test(this.state.emailValue)) {
      await this.props.setEmail(this.state.emailValue)
      this.props.navigation.navigate(this.props.nextOnboardingStep)
    } else {
      this.setState({
        emailError: String(
          fbt(
            'That does not look like a valid email.',
            'EmailScreen.invalidEmail'
          )
        )
      })
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            <fbt desc="EmailScreen.title">Let&apos;s get started</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="EmailScreen.subtitle">
              What&apos;s your email address?
            </fbt>
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            onChangeText={this.handleChange}
            onSubmitEditing={this.handleSubmit}
            value={this.state.emailValue}
            style={[styles.input, this.state.emailError ? styles.invalid : {}]}
            autofocus={true}
          />
          {this.state.emailError.length > 0 && (
            <Text style={styles.invalid}>{this.state.emailError}</Text>
          )}
          <View style={styles.legalContainer}>
            <Text style={styles.legal}>
              <fbt desc="EmailScreen.disclaimer">
                We will use your email to notify you of important notifications
                when you buy or sell.
              </fbt>
            </Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'EmailScreen.continueButton')}
            disabled={!this.state.emailValue.length || this.state.emailError}
            onPress={this.handleSubmit}
          />
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

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EmailScreen)
)

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
  buttonsContainer: {
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
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
    textAlign: 'center',
    color: '#293f55'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 20,
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  input: {
    fontSize: 20,
    borderColor: '#c0cbd4',
    borderBottomWidth: 1,
    paddingTop: 20,
    paddingBottom: 10,
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
