'use strict'

import { Dimensions, StyleSheet } from 'react-native'

const { height } = Dimensions.get('window')
const smallScreen = height < 812

export default StyleSheet.create({
  container: {
    flex: 1
  },
  // General background
  greyBackground: {
    backgroundColor: '#f7f8f8'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    paddingBottom: 20,
    width: '100%',
    justifyContent: 'flex-end'
  },
  // Dark background colour used by modals
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  // General title styling
  title: {
    fontFamily: 'Lato',
    fontSize: smallScreen ? 28 : 34,
    fontWeight: '600',
    padding: 20,
    color: '#0b1823',
    textAlign: 'center'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: smallScreen ? 18 : 20,
    paddingBottom: 10,
    fontWeight: '300',
    textAlign: 'center',
    paddingHorizontal: 20
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
