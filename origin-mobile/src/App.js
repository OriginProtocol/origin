import React, { Component } from 'react'
import {Alert, StyleSheet, Text, View, TouchableOpacity, TextInput} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'
import originWallet, {Events} from './OriginWallet'
import NavigationService from './NavigationService'

import { fetchProfile } from 'actions/Profile'
import { getBalance } from 'actions/Wallet'
import { newEvent, updateEvent, processedEvent, setActiveEvent } from 'actions/WalletEvents'
import { setDevices } from 'actions/Devices'

import { connect, Provider } from 'react-redux'

import Store from './Store'

import {
  createBottomTabNavigator,
  createStackNavigator,
} from 'react-navigation'
import { FlatList, Image, Modal, SectionList, StatusBar, TouchableHighlight, YellowBox } from 'react-native'

import ScanMarker from './components/scan-marker'

import AlertsScreen from './screens/alerts'
import DevicesScreen from './screens/devices'
import HomeScreen from './screens/home'
import SettingsScreen from './screens/settings'
import WalletScreen from './screens/wallet'

const IMAGES_PATH = "../assets/images/"

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])


class ScanScreen extends Component {
  static navigationOptions = {
    title: 'Scan',
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }
    
  render() {
    return (
      <View style={{ flex: 1 }}>
        <QRCodeScanner
          reactivate={true}
          reactivateTimeout={5000}
          onRead={originWallet.onQRScanned}
          showMarker={true}
          customMarker={<ScanMarker />}
          cameraStyle={{ height: '100%' }}
        />
      </View>
    )
  }
}

const navigationOptions = ({ navigation }) => ({
  headerStyle: {
    backgroundColor: 'white',
  },
})

const AlertsStack = createStackNavigator({
  Alerts: AlertsScreen,
}, {
  navigationOptions,
})

const HomeStack = createStackNavigator({
  Home: HomeScreen,
}, {
  navigationOptions,
})

const ScanStack = createStackNavigator({
  Scan: ScanScreen,
}, {
  navigationOptions,
})

const SettingsStack = createStackNavigator({
  Devices: DevicesScreen,
  Settings: SettingsScreen,
  Wallet: WalletScreen,
}, {
  initialRouteName: 'Settings',
  navigationOptions,
})

const OriginNavigator = createBottomTabNavigator({
  Alerts: AlertsStack,
  Home: HomeStack,
  Scan: ScanStack,
  Settings: SettingsStack,
}, {
  initialRouteName: 'Home',
  order: ['Home', 'Alerts', 'Scan', 'Settings'],
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state

      // require expects string literal :(
      if (routeName === 'Alerts') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'alerts-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'alerts-inactive.png')} />
      } else if (routeName === 'Home') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'home-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'home-inactive.png')} />
      } else if (routeName === 'Scan') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'scan-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'scan-inactive.png')} />
      } else if (routeName === 'Settings') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'settings-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'settings-inactive.png')} />
      }
    },
  }),
  tabBarOptions: {
    activeTintColor: '#007fff',
    inactiveTintColor: 'white',
    style: {
      backgroundColor: '#293f55',
    },
    iconStyle: {
      marginTop: 10,
    },
    labelStyle: {
      fontFamily: 'Lato',
      fontSize: 10,
      fontWeight: 'normal',
    },
    tabStyle: {
      justifyContent: 'space-around',
    }
  },
})

const styles = StyleSheet.create({
  centerText: {
    fontSize: 18,
    padding: 10,
    textAlign:'center',
  },
  textBold: {
    fontWeight: '500',
  },
  buttonText: {
    color: 'rgb(0,122,255)',
    fontSize: 21,
  },
  buttonTouchable: {
    padding: 16,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    height: 40,
    margin: 15,
  },
})

// Origin Nav wrapper
class OriginNavWrapper extends Component {

  render() {
    return <OriginNavigator ref={navigatorRef=>
        NavigationService.setTopLevelNavigator(navigatorRef)
    } />
  }

  componentDidMount() {
    //register the service here
    originWallet.events.on(Events.PROMPT_LINK, (data, matcher) => {
      this.props.newEvent(matcher, data)
      this.props.setActiveEvent(data)
      NavigationService.navigate("Alerts")
    })
    originWallet.events.on(Events.PROMPT_TRANSACTION, (data, matcher) => {
      this.props.newEvent(matcher, data)
      this.props.setActiveEvent(data)
      NavigationService.navigate("Alerts")
    })
    originWallet.events.on(Events.PROMPT_SIGN, (data, matcher) => {
      this.props.newEvent(matcher, data)
      this.props.setActiveEvent(data)
      NavigationService.navigate("Alerts")
    })

    originWallet.events.on(Events.NEW_ACCOUNT, (data, matcher) => {
      this.props.fetchProfile()
      this.props.getBalance()
    })

    originWallet.events.on(Events.LINKED, (data, matcher) => {
      this.props.processedEvent(matcher, {}, data)
      NavigationService.navigate("Home")
    })

    originWallet.events.on(Events.TRANSACTED, (data, matcher) => {
      this.props.processedEvent(matcher, {status:'completed'}, data)
      this.props.getBalance()
      NavigationService.navigate("Home")
    })

    originWallet.events.on(Events.UNLINKED, (data, matcher) => {
      this.props.updateEvent(matcher, {linked:false})
    })

    originWallet.events.on(Events.REJECT, (data, matcher) => {
      this.props.processedEvent(matcher, {status:'rejected'}, data)
      NavigationService.navigate("Home")
    })

    originWallet.events.on(Events.LINKS, (devices) => {
      this.props.setDevices(devices)
    })

    originWallet.events.on(Events.UPDATE, () => {
      this.props.getBalance()
    })

    originWallet.openWallet()
  }

  componentWillUnmount() {
    originWallet.closeWallet()
  }
}

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
  getBalance: () => dispatch(getBalance()),
  newEvent: (matcher, event) => dispatch(newEvent(matcher, event)),
  updateEvent: (matcher, update) => dispatch(updateEvent(matcher, update)),
  processedEvent: (matcher, update, new_event) => dispatch(processedEvent(matcher, update, new_event)),
  setActiveEvent:(event) => dispatch(setActiveEvent(event)),
  setDevices:(devices) => dispatch(setDevices(devices))
})

const OriginNavApp = connect(undefined, mapDispatchToProps)(OriginNavWrapper)

export default class OriginApp extends Component {
  render() {
    return <Provider store={Store}>
        <OriginNavApp />
      </Provider>
  }
}
