'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'

import {
  setEmailVerified,
  setPhoneVerified,
  setName,
  setAvatarUri
} from 'actions/Onboarding'
import withOriginGraphql from 'hoc/withOriginGraphql'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

class ReadyScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  async componentDidMount() {
    this.publishIdentity()
  }

  publishIdentity = async () => {
    const profile = {
      firstName: this.props.onboarding.firstName,
      lastName: 'Test', //this.props.onboarding.lastName,
      avatarUrl: this.props.onboarding.avatarUrl
    }

    const attestations = []
    if (this.props.onboarding.emailAttestation) {
      attestations.push(JSON.stringify(this.props.onboarding.emailAttestation))
    }
    if (this.props.onboarding.phoneAttestation) {
      attestations.push(JSON.stringify(this.props.onboarding.phoneAttestation))
    }

    const from = this.props.wallet.activeAccount.address

    console.debug('Publishing identity')

    let response
    try {
      response = await this.props.publishIdentity(
        from,
        profile,
        attestations
      )
    } catch (error) {
      console.warn('Identity publication failed: ', error)
    }

    console.log(response)

    this.setState({ loading: false })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.loading ? this.renderLoading() : this.renderReady()}
      </SafeAreaView>
    )
  }

  renderReady() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'green-checkmark.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>
            <fbt desc="ReadyScreen.title">
              You&apos;re ready to start buying and selling on Origin
            </fbt>
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Start using Origin', 'ReadyScreen.button')}
            onPress={() => {
              // Navigate to subroute to skip authentication requirement
              this.props.navigation.navigate('App')
            }}
          />
        </View>
      </>
    )
  }

  renderLoading() {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>
          <fbt desc="ReadyScreen.loadingTitle">Publishing your account</fbt>
        </Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => {
  return { onboarding, wallet }
}

const mapDispatchToProps = dispatch => ({
  setEmailVerified: email => dispatch(setEmailVerified(email)),
  setPhoneVerified: phone => dispatch(setPhoneVerified(phone)),
  setName: payload => dispatch(setName(payload)),
  setAvatarUri: avatarUri => dispatch(setAvatarUri(avatarUri)),
  setIdentity: identity => dispatch(setIdentity(identity))
})

export default withOriginGraphql(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReadyScreen)
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  image: {
    marginBottom: '10%'
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  }
})
