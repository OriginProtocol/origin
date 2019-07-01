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
    fontSize: smallScreen ? 28 : 36,
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
  menuContainer: {
    flex: 1,
    backgroundColor: '#f7f8f8'
  },
  menuHeadingContainer: {
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 30
  },
  menuHeading: {
    fontFamily: 'Lato',
    fontSize: 13,
    opacity: 0.5,
    textTransform: 'uppercase'
  },
  menuHeadingIcon: {
    height: 24,
    width: 24
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: '5%'
  },
  menuItemIconContainer: {
    height: 17,
    justifyContent: 'center'
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  cardContent: {
    fontSize: 14,
    marginBottom: 40,
    textAlign: 'center'
  },
  cardHeading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontWeight: '600',
    fontSize: 35,
    marginBottom: 20,
    textAlign: 'center'
  },
  cardCancelText: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  }
})
