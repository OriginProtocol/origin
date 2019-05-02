'use strict'

import React from 'react'
import { DeviceEventEmitter, Dimensions, Image, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import Welcome from 'components/welcome'
import { setCarouselStatus } from 'actions/Activation'

const IMAGES_PATH = '../../assets/images/'

class WelcomeScreen extends React.Component {
  constructor(props) {
    super(props)

    this.onCompletion = this.onCompletion.bind(this)

    // Complete on response to notification allow/deny popup on iOS
    DeviceEventEmitter.addListener('notificationPermission', this.onCompletion)
  }

  onCompletion() {
    this.props.setCarouselStatus(true)
    this.props.navigation.navigate('Onboarding')
  }

  render() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <Welcome
        onCompletion={this.onCompletion}
        onEnableNotifications={() => {
          DeviceEventEmitter.emit('requestNotificationPermissions')
        }}
        pages={[
          {
            image: (
              <Image
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={require(IMAGES_PATH + 'carousel-1.png')}
                style={[styles.image, smallScreen ? { height: '20%' } : {}]}
              />
            ),
            title: 'Store & Use Crypto',
            subtitle:
              'Origin Wallet allows you to store cryptocurrency to buy and sell on the Origin platform.'
          },
          {
            image: (
              <Image
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={require(IMAGES_PATH + 'carousel-2.png')}
                style={[styles.image, smallScreen ? { height: '20%' } : {}]}
              />
            ),
            title: 'Message Buyers & Sellers',
            subtitle:
              'You can communicate with other users of the Origin platform in a secure and decentralized way.'
          },
          {
            image: (
              <Image
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={require(IMAGES_PATH + 'carousel-3.png')}
                style={[styles.image, smallScreen ? { height: '20%' } : {}]}
              />
            ),
            title: 'Stay Up-To-Date',
            subtitle:
              'Get timely updates about new messages or activity on your listings and purchases.'
          }
        ]}
      />
    )
  }
}

const styles = StyleSheet.create({
  image: {
    marginBottom: '10%'
  }
})

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = dispatch => ({
  setCarouselStatus: bool => dispatch(setCarouselStatus(bool))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WelcomeScreen)
