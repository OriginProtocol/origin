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
  backArrow: {
    position: 'absolute',
    left: -10,
    top: 18
  }
})
