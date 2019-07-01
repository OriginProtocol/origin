'use strict'

import React, { Component } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'

import { setName } from 'actions/Onboarding'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import CommonStyles from 'styles/common'
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
      <KeyboardAvoidingView
        style={styles.darkOverlay}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={styles.onboardingModal}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps={'always'}
          >
            <View style={{ ...styles.container, justifyContent: 'flex-start' }}>
              <Text style={styles.title}>
                <fbt desc="NameScreen.title">Create a profile</fbt>
              </Text>
            </View>
            <View style={{ ...styles.container }}>
              <Text style={styles.subtitle}>
                <fbt desc="NameScreen.firstNameSubtitle">
                  Enter your first name
                </fbt>
              </Text>
              <TextInput
                autoCapitalize="words"
                autoCompleteType="name"
                autoFocus={true}
                autoCorrect={false}
                multiline={false}
                onChangeText={value => this.handleChange('firstName', value)}
                onSubmitEditing={() => this.lastNameTextInput.focus()}
                value={this.state.firstNameValue}
                style={[
                  styles.input,
                  this.state.firstNameError ? styles.invalid : {}
                ]}
                textContentType="givenName"
              />
              {this.state.firstNameError.length > 0 && (
                <Text style={styles.invalid}>{this.state.firstNameError}</Text>
              )}
              <Text style={styles.subtitle}>
                <fbt desc="NameScreen.lastNameSubtitle">
                  Enter your last name
                </fbt>
              </Text>
              <TextInput
                ref={ref => (this.lastNameTextInput = ref)}
                autoCapitalize="words"
                autoCompleteType="name"
                autoCorrect={false}
                multiline={false}
                onChangeText={value => this.handleChange('lastName', value)}
                onSubmitEditing={this.handleSubmit}
                value={this.state.lastNameValue}
                style={[
                  styles.input,
                  this.state.lastNameError ? styles.invalid : {}
                ]}
                textContentType="familyName"
              />
              {this.state.lastNameError.length > 0 && (
                <Text style={styles.invalid}>{this.state.lastNameError}</Text>
              )}
            </View>
            <View style={{ ...styles.container, ...styles.buttonContainer }}>
              {this.renderVisibilityWarning()}
              <OriginButton
                size="large"
                type="primary"
                title={fbt('Continue', 'NameScreen.continueButton')}
                disabled={
                  !this.state.firstNameValue || !this.state.lastNameValue
                }
                onPress={this.handleSubmit}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }

  renderVisibilityWarning() {
    return (
      <View style={[styles.visibilityWarningContainer, styles.isVisible]}>
        <Text style={styles.visibilityWarningHeader}>
          <fbt desc="NameScreen.visibilityWarningHeader">
            What will be visible on the blockchain?
          </fbt>
        </Text>
        <Text style={styles.visibilityWarningText}>
          <fbt desc="NameScreen.visibilityWarningText">
            Your name will be visible on the blockchain
          </fbt>
        </Text>
      </View>
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
  ...CommonStyles,
  ...OnboardingStyles
})
