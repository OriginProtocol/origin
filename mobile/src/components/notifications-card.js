import React, { Component } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import {
  promptForNotifications,
  storeNotificationsPermissions
} from 'actions/Activation'

import OriginButton from 'components/origin-button'

import originWallet from '../OriginWallet'

class Card extends Component {
  constructor(props) {
    super(props)

    this.handleEnable = this.handleEnable.bind(this)
    this.handleSkip = this.handleSkip.bind(this)
    this.state = {}
  }

  async handleEnable() {
    try {
      const permissions = await originWallet.requestNotifications()

      if (!permissions.alert) {
        Alert.alert(
          '!',
          `You've declined our request to turn on push notifications, which we HIGHLY recommend. To fix this, you will need to change the permissions in your iPhone's Settings > Notifications > Origin Wallet.`,
          [
            {
              text: 'OK',
              onPress: () =>
                this.props.storeNotificationsPermissions(permissions)
            }
          ]
        )
      } else {
        this.props.storeNotificationsPermissions(permissions)
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  handleSkip() {
    // this.props.promptForNotifications()
    this.props.onPress()
  }

  render() {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Enable Notifications</Text>
        <Text style={styles.content}>
          We highly recommend enabling notifications to get the latest updates
          about your transaction with timely alerts.
        </Text>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Enable Notifications'}
            onPress={this.handleEnable}
          />
        </View>
        <TouchableOpacity onPress={this.handleSkip}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = dispatch => ({
  promptForNotifications: () => dispatch(promptForNotifications(null)),
  storeNotificationsPermissions: permissions =>
    dispatch(storeNotificationsPermissions(permissions))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Card)

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 20
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  content: {
    fontFamily: 'Lato',
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 300,
    textAlign: 'center'
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  }
})
