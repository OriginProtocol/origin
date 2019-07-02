'use strict'

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#f7f8f8'
  },
  listHeaderContainer: {
    paddingHorizontal: 18 * 3,
    paddingVertical: 22
  },
  listHeader: {
    color: '#6a8296',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center'
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: 14
  },
  listSelectedItem: {
    marginRight: 17
  },
  listItemIconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  listItemTextContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  listSeparator: {
    backgroundColor: 'white',
    height: 1,
    marginRight: 'auto',
    width: '5%'
  }
})
