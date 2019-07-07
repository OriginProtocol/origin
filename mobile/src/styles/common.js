'use strict'

import { Dimensions, StyleSheet } from 'react-native'

const { height } = Dimensions.get('window')
const smallScreen = height < 812

export default StyleSheet.create({
  // Dark background colour used by modals
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    marginBottom: 20
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  // General title styling
  title: {
    fontFamily: 'Lato',
    fontSize: smallScreen ? 28 : 34,
    fontWeight: '600',
    paddingTop: 20,
    paddingBottom: 20,
    color: '#293f55',
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
  image: {
    marginBottom: 20
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
