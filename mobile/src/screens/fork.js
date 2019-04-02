import React, { Component } from 'react'
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import AccountModal from 'components/account-modal'
import OriginButton from 'components/origin-button'
import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class ForkScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.toggleModal = this.toggleModal.bind(this)
  }

  static navigationOptions = {
    title: 'Get Started'
  }

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'wallet.png')}
            style={[
              styles.image,
              this.props.screenProps.smallScreen ? { height: '33%' } : {}
            ]}
          />
          <Text style={styles.title}>Create Or Import A Wallet</Text>
          <Text style={styles.subtitle}>
            Create a new wallet and transder funds into it or import an existing
            wallet that you already use.
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Create New Wallet'}
            onPress={() => originWallet.createAccount()}
          />
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Import Existing Wallet'}
            onPress={this.toggleModal}
          />
        </View>
        <AccountModal
          dark={true}
          heading="Import Wallet"
          visible={this.state.modalOpen}
          onPress={this.toggleModal}
          onRequestClose={this.toggleModal}
        />
      </SafeAreaView>
    )
  }
}

export default ForkScreen

const styles = StyleSheet.create({
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#293f55',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
  title: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: '300',
    marginHorizontal: 50,
    paddingBottom: 15,
    textAlign: 'center'
  },
  subtitle: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    marginHorizontal: 50,
    textAlign: 'center'
  }
})
