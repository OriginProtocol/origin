'use strict'

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
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
  menuItemInactionable: {
    opacity: 0.75
  },
  menuItemIconContainer: {
    height: 17,
    justifyContent: 'center'
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Lato'
  }
})
