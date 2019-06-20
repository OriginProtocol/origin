'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setName } from 'actions/Onboarding'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'

class NameScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firstNameValue: '',
      firstNameError: '',
      lastNameValue: '',
      lastNameError: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(field, value) {
    this.setState({
      [`${field}Error`]: '',
      [`${field}Value`]: value
    })
  }

  async handleSubmit() {
    await this.props.setName({
      firstName: this.state.firstNameValue,
      lastName: this.state.lastNameValue
    })
    this.props.navigation.navigate(this.props.nextOnboardingStep)
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            <fbt desc="NameScreen.title">Create a profile</fbt>
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.subtitle}>
              <fbt desc="NameScreen.firstNameSubtitle">
                Enter your first name
              </fbt>
            </Text>
            <TextInput
              autoCapitalize="none"
              autoFocus={true}
              autoCorrect={false}
              multiline={false}
              onChangeText={value => this.handleChange('firstName', value)}
              onSubmitEditing={this.handleSubmit}
              value={this.state.firstNameValue}
              style={[
                styles.input,
                this.state.firstNameError ? styles.invalid : {}
              ]}
            />
            {this.state.firstNameError.length > 0 && (
              <Text style={styles.invalid}>{this.state.firstNameError}</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.subtitle}>
              <fbt desc="NameScreen.lastNameSubtitle">Enter your last name</fbt>
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
              onChangeText={value => this.handleChange('lastName', value)}
              onSubmitEditing={this.handleSubmit}
              value={this.state.lastNameValue}
              style={[
                styles.input,
                this.state.lastNameError ? styles.invalid : {}
              ]}
            />
            {this.state.lastNameError.length > 0 && (
              <Text style={styles.invalid}>{this.state.lastNameError}</Text>
            )}
          </View>
        </View>
        <View style={[styles.visibilityWarningContainer, styles.isVisible]}>
          <Text style={styles.visibilityWarningHeader}>
            What will be visible on the blockchain?
          </Text>
          <Text style={styles.visibilityWarningText}>
            Your name will be visible on the blockchain
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'NameScreen.continueButton')}
            disabled={!this.state.firstNameValue || !this.state.lastNameValue}
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
  setName: payload => dispatch(setName(payload))
})

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(NameScreen)
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
