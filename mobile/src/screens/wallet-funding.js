'use strict'

import React, { Component } from 'react'
import { Alert, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'

import {
  promptForNotifications,
  setBackupWarningStatus
} from 'actions/Activation'

class WalletFundingScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.getParam('currency').toUpperCase()} Balance`,
    headerTitleStyle: {
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal'
    }
  })

  componentDidMount() {
    const { activation, navigation } = this.props
    const hasNotificationsEnabled =
      activation.notifications.permissions.hard.alert
    const { method } = navigation.state.params.item.meta

    !hasNotificationsEnabled && this.props.promptForNotifications(method)

    // prompt with private key backup warning if before recommending funding
    if (!activation.backupWarningDismissed) {
      Alert.alert(
        'Important!',
        `Be sure to back up your private key so that you don't lose access to your wallet. If your device is lost or you delete this app, we won't be able to help recover your funds.`,
        [
          {
            text: `Done. Don't show me this again.`,
            onPress: () => {
              this.props.setBackupWarningStatus(true, Date.now())
            }
          },
          {
            text: 'Show Private Key',
            onPress: () => {
              this.props.setBackupWarningStatus(true)
            }
          }
        ]
      )
    }
  }

  render() {
    return <Text>Funding</Text>
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
  promptForNotifications: method => dispatch(promptForNotifications(method)),
  setBackupWarningStatus: (bool, datetime) =>
    dispatch(setBackupWarningStatus(bool, datetime))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletFundingScreen)

const styles = StyleSheet.create({
  address: {
    color: '#6a8296',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300'
  },
  balance: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '300'
  },
  button: {
    marginBottom: 10
  },
  buttonsContainer: {
    flex: 0,
    width: '100%'
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingVertical: '5%'
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  contentBody: {
    fontFamily: 'Lato',
    fontWeight: '300',
    textAlign: 'center'
  },
  contentHeading: {
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 10
  },
  currency: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  icon: {
    marginBottom: 15
  }
})
