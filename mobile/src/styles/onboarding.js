'use strict'

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  onboardingModal: {
    flex: 1,
    marginHorizontal: 2,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  legalContainer: {
    fontSize: 14,
    paddingTop: 10,
    paddingBottom: 10,
    width: '90%'
  },
  legal: {
    textAlign: 'center',
    color: '#98a7b4'
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  },
  input: {
    fontSize: 18,
    borderColor: '#c0cbd4',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: '80%'
  },
  visibilityWarningContainer: {
    borderColor: '#98a7b4',
    backgroundColor: 'rgba(152, 167, 180, 0.1)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '95%',
    alignSelf: 'center'
  },
  visibilityWarningHeader: {
    fontWeight: '600',
    paddingBottom: 5,
    textAlign: 'center'
  },
  visibilityWarningText: {
    textAlign: 'center'
  },
  termsHeader: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  termsText: {
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#111d28'
  },
  termsHighlightContainer: {
    borderColor: '#98a7b4',
    backgroundColor: 'rgba(152, 167, 180, 0.1)',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 20,
    width: '90%',
    borderRadius: 5
  },
  termsHighlightText: {
    color: '#6f8294'
  },
  isVisible: {
    borderColor: '#f4c110',
    backgroundColor: 'rgba(244, 193, 16, 0.1)'
  }
})
