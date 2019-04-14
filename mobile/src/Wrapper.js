'use strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Image, StyleSheet, YellowBox } from 'react-native'
import { connect } from 'react-redux'

import NavigationService from './NavigationService'
import Onboarding from 'components/onboarding'
import { OriginNavigator, OnboardingStack } from './Navigation'
import { setCarouselStatus } from 'actions/Activation'

const IMAGES_PATH = '../assets/images/'

class OriginWrapper extends Component {
  constructor(props) {
    super(props)
    DeviceEventEmitter.addListener(
      'notificationPermission',
      this.handleNotificationPermission.bind(this)
    )
  }

  componentDidUpdate() {
    const { activation, wallet } = this.props
    if (wallet.accounts.length && wallet.activeAccount) {
      const balances =
        wallet.accountBalanceMapping[wallet.activeAccount.address]

      // Prompt with private key backup warning if funds are detected
      if (
        !activation.backupWarningDismissed &&
        balances &&
        Number(balances.eth) > 0
      ) {
        NavigationService.navigate('Home', {
          backupWarning: true,
          walletExpanded: true
        })
      }
    }
  }

  render() {
    const { activation, wallet } = this.props
    const { carouselCompleted } = activation

    if (!carouselCompleted) {
      return this.renderOnboardingCarousel()
    } else if (!wallet.accounts.length) {
      return this.renderOnboardingStack()
    } else {
      return this.renderNavigator()
    }
  }

  renderOnboardingStack() {
    return (
      <OnboardingStack screenProps={{ smallScreen: this.props.smallScreen }} />
    )
  }

  handleNotificationPermission(permissions) {
    console.debug('Got notification permissions: ', permissions)
    // We don't care if the permission was denied or accepted, we still want
    // to advance
    this.props.setCarouselStatus(true)
  }

  renderOnboardingCarousel() {
    return (
      <Onboarding
        onCompletion={() => this.props.setCarouselStatus(true)}
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
                style={[
                  styles.image,
                  this.props.smallScreen ? { height: '33%' } : {}
                ]}
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
                style={[
                  styles.image,
                  this.props.smallScreen ? { height: '33%' } : {}
                ]}
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
                style={[
                  styles.image,
                  this.props.smallScreen ? { height: '33%' } : {}
                ]}
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

  renderNavigator() {
    return (
      <OriginNavigator
        ref={navigatorRef =>
          NavigationService.setTopLevelNavigator(navigatorRef)
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  image: {
    marginBottom: '10%'
  }
})

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
  setCarouselStatus: bool => dispatch(setCarouselStatus(bool))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWrapper)
