'use strict'

import React, { Component } from 'react'
import { StyleSheet, Image, View, Text } from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { SvgUri } from 'react-native-svg'
import get from 'lodash.get'

import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const BASE_URL = `https://www.originprotocol.com`
const COFNIG_BASE_URL = `${BASE_URL}/static/partnerconf`

class PartnerWelcomeScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      config: null
    }

    const { referralCode } = this.props.settings

    if (!referralCode || !referralCode.startsWith('op:')) {
      console.debug('skipping partner welcome...')
      this.next()
    }
    this.getConfig()
  }

  next() {
    if (this.props.settings.referralCode) {
      // We want to direct the user directly to dapp onboarding
      const url = new URL(this.props.settings.network.dappUrl)
      url.hash =
        '/onboard?referralCode=' +
        encodeURIComponent(this.props.settings.referralCode)
      const dappUrl = String(url)

      this.props.navigation.navigate('Marketplace', { dappUrl })
    } else {
      return this.props.navigation.navigate('Marketplace')
    }
  }

  async getConfig() {
    const {
      settings: { referralCode }
    } = this.props

    if (referralCode && referralCode.startsWith('op:')) {
      const partnerCode = referralCode.split(':')[1]
      const url = `${COFNIG_BASE_URL}/campaigns.json`

      console.log(`fetching config from ${url}`)

      let resp
      try {
        resp = await fetch(url)
      } catch (err) {
        console.error(err)
        return this.next()
      }

      if (resp.status !== 200) {
        console.warn('originprotocol.com did not return 200')
        return this.next()
      }

      const jason = await resp.json()

      if (!Object.prototype.hasOwnProperty.call(jason, partnerCode)) {
        console.log('Did not find referral code in config')
        return this.next()
      }

      console.debug('Got partner config', jason[partnerCode])

      this.setState({
        config: jason[partnerCode]
      })
    }
  }

  render() {
    const { config } = this.state

    if (!config) {
      console.debug('no config, not rendering')
      return null
    }

    const logo = get(config, 'partner.logo')

    let logoURL,
      height = 90,
      width = 190
    if (typeof logo === 'object') {
      height = logo.height || 90
      width = logo.width || 190
      logoURL = `${BASE_URL}${logo.uri}`
    } else {
      logoURL = `${BASE_URL}${logo}`
    }

    const logoImage = logoURL.endsWith('svg') ? (
      <SvgUri width={width} height={height} uri={logoURL} />
    ) : (
      <Image style={{ width, height }} source={{ uri: logoURL }} />
    )

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logo}>{logoImage}</View>
          <View style={styles.welcomeMessage}>
            <Text style={styles.welcome}>
              <fbt desc="PartnerWelcome.welcome">
                Welcome! We see you’re a
                <fbt:param name="partnerName">{config.partner.name}</fbt:param>
                customer. Click continue to create your account and join Origin
                Rewards.
              </fbt>
            </Text>
          </View>
          <View style={styles.reward}>
            <Text style={styles.rewardText}>
              {Number(config.reward.value).toLocaleString()}{' '}
              {config.reward.currency.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            title={fbt('Continue', 'PartnerWelcome.continueButton')}
            onPress={() => {
              this.next()
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(mapStateToProps)(PartnerWelcomeScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  logo: {
    marginTop: 0,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  welcomeMessage: {},
  welcome: {
    fontFamily: 'Lato',
    fontSize: 18,
    marginTop: 45,
    marginBottom: 45
  },
  reward: {
    width: 255,
    height: 90,
    maxHeight: 90,
    borderRadius: 10,
    backgroundColor: '#f0f6f9',
    /*display: 'flex',
    flexDirection: 'row',*/
    flex: 1
  },
  rewardText: {
    fontFamily: 'Poppins',
    fontSize: 38,
    fontWeight: 'bold',
    lineHeight: 90,
    color: '#000',
    textAlign: 'center'
  }
})
