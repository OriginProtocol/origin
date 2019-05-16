'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default class PinInput extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const placeholder = []
    for (let i = 0; i < this.props.pinLength; i++) {
      placeholder.push(this.renderPlaceholder(i))
    }

    return (
      <>
        <TouchableOpacity style={styles.pinCode} onPress={() => this.textInput.focus()}>
          {placeholder}
        </TouchableOpacity>
        <TextInput
          ref={ref => this.textInput = ref}
          autoFocus={true}
          value={this.props.value}
          enablesReturnKeyAutomatically={false}
          keyboardType="numeric"
          pinLength={this.props.pinLength || 6}
          onChangeText={this.props.onChangeText}
          style={styles.input}
        />
      </>
    )
  }

  renderPlaceholder(i) {
    const value = this.props.value[i] ? this.props.value[i] : '-'
    return (
      <Text style={styles.pinCodeText} key={i}>
        {value}
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  pinCode: {
    flex: -1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    width: 250
  },
  pinCodeText: {
    fontSize: 40
  },
  input: {
    right: -400
  }
})
