'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setName } from 'actions/Settings'
import OriginButton from 'components/origin-button'

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

  handleSubmit() {
    this.props.setName({
      firstName: this.state.firstNameValue,
      lastName: this.state.lastNameValue
    })
    this.props.navigation.navigate('ProfileImage')
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
              placeholder="john"
              autoCapitalize="none"
              autoFocus={true}
              autoCorrect={false}
              multiline={true}
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
              placeholder="doe"
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NameScreen)

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
    textAlign: 'center'
  },
  inputContainer: {
    paddingBottom: 30
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
