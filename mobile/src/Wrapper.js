'use strict'

import React, { Component } from 'react'
import { Image, StyleSheet, YellowBox } from 'react-native'
import { connect } from 'react-redux'

import NavigationService from './NavigationService'
import Onboarding from 'components/onboarding'
import { OriginNavigator, OnboardingStack } from './Navigation'
import { updateCarouselStatus } from 'actions/Activation'

const IMAGES_PATH = '../assets/images/'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

class OriginWrapper extends Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {}

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

  renderOnboardingCarousel() {
    console.log(this.props)
    return (
      <Onboarding
        onCompletion={() => this.props.updateCarouselStatus(true)}
        onEnable={this.handleNotifications}
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
  updateCarouselStatus: bool => dispatch(updateCarouselStatus(bool))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWrapper)
