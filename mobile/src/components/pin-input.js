'use strict'

import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'

const PinInput = props => {
  const placeholder = []
  for (let i = 0; i < props.pinLength; i++) {
    const value = props.value[i] ? props.value[i] : '-'
    placeholder.push(
      <Text style={styles.pinCodeText} key={i}>
        {value}
      </Text>
    )
  }

  return (
    <>
      <TouchableOpacity
        style={styles.pinCode}
        onPress={() => this.textInput.focus()}
      >
        {placeholder}
      </TouchableOpacity>
      <TextInput
        ref={ref => (this.textInput = ref)}
        autoFocus={true}
        value={props.value}
        keyboardType="numeric"
        pinLength={props.pinLength || 6}
        onChangeText={props.onChangeText}
        onSubmitEditing={props.onSubmitEditing}
        style={styles.input}
      />
    </>
  )
}

export default PinInput

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
