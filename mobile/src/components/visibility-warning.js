'use strict'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { fbt } from 'fbt-runtime'

const VisbilityWarning = ({ isVisible, children }) => (
  <View style={[styles.container, isVisible ? styles.isVisible : {}]}>
    <Text style={styles.header}>
      <fbt desc="VisibilityWarning.header">
        What will be visible on the blockchain?
      </fbt>
    </Text>
    <Text style={styles.text}>{children}</Text>
  </View>
)

export default VisbilityWarning

const styles = StyleSheet.create({
  container: {
    borderColor: '#98a7b4',
    backgroundColor: 'rgba(152, 167, 180, 0.1)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '95%',
    alignSelf: 'center'
  },
  header: {
    fontWeight: '600',
    paddingBottom: 5,
    textAlign: 'center',
    fontFamily: 'Lato'
  },
  text: {
    textAlign: 'center',
    fontFamily: 'Lato'
  },
  isVisible: {
    borderColor: '#f4c110',
    backgroundColor: 'rgba(244, 193, 16, 0.1)'
  }
})
