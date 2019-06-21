'use strict'

import { NavigationActions } from 'react-navigation'

let _navigator

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef
}

function navigate(routeName, params) {
  if (_navigator) {
    _navigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params
      })
    )
  }
}

export const getCurrentRoute = () => {
  if (navigator) {
    let navIterator = _navigator.state.nav
    while (navIterator.index != null) {
      navIterator = navIterator.routes[navIterator.index]
    }
    return navIterator.routeName
  }
  return undefined
}

// Add other navigation functions that you need and export them
export default {
  navigate,
  setTopLevelNavigator
}
