import React, { Component } from 'react'
import { Alert, Clipboard, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'

import Address from 'components/address'
import Currency from 'components/currency'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { getCurrentNetwork } from 'utils/networks'
import { toOgns } from 'utils/ogn'
import { evenlySplitAddress } from 'utils/user'

import originWallet from '../OriginWallet'

const IMAGES_PATH = '../../assets/images/'

class WalletModal extends Component {
  constructor(props) {
    super(props)

    this.handleDangerousCopy = this.handleDangerousCopy.bind(this)
    this.handleFunding = this.handleFunding.bind(this)
  }

  handleDangerousCopy(privateKey) {
    Alert.alert(
      'Warning!',
      'Copying your private key to the clipboard is dangerous. It could potentially be read by other malicious programs. Are you sure that you want to do this?',
      [
        { text: 'No, cancel!', onPress: () => console.log('Canceled private key copy') },
        { text: 'Yes, I understand.', onPress: async () => {
          await Clipboard.setString(privateKey)

          Alert.alert('Copied to clipboard!')
        }},
      ],
    )
  }

  handleFunding(currency) {
    const apiHost = originWallet.getCurrentRemoteLocal()
    const currentNetwork = getCurrentNetwork(apiHost)
    const { address } = this.props.wallet

    if (currency === 'ETH' && currentNetwork.custom) {
      originWallet.giveMeEth('1')
    } else {
      Alert.alert(
        'Funding',
        `For now, you will need to transfer ${currency} into your Orign Wallet from another source.`,
        [
          { text: 'Show Address', onPress: () => {
            Alert.alert('Wallet Address', evenlySplitAddress(address).join('\n'))
          }},
          { text: 'Copy Address', onPress: async () => {
            await Clipboard.setString(address)

            Alert.alert('Copied to clipboard!', evenlySplitAddress(address).join('\n'))
          }},
        ],
      )
    }
  }

  render() {
    const { address, onPress, visible, wallet } = this.props
    const { /*dai, */eth, ogn } = wallet.balances

    const ethBalance = web3.utils.fromWei(eth, 'ether')
    const ognBalance = toOgns(ogn)
    const privateKey = address ? web3.eth.accounts.wallet[0].privateKey : ''

    return (
      <Modal
        animationType="slide"
        visible={visible}
        onRequestClose={() => { console.log('Wallet modal closed') } }
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.nav}>
            <View style={styles.navImageContainer} />
            <View style={styles.navHeadingContainer}>
              <Text style={styles.heading}>Wallet Balances</Text>
            </View>
            <TouchableOpacity onPress={onPress} style={styles.navImageContainer}>
              <Image source={require(`${IMAGES_PATH}close-icon.png`)} style={styles.close} />
            </TouchableOpacity>
          </View>
          <View style={styles.addressContainer}>
            <Address address={address} label={'Wallet Address'} style={styles.address} />
          </View>
          <ScrollView
            style={styles.svContainer}
            contentContainerStyle={styles.walletSVContainer}
          >
            <Currency
              abbreviation={'ETH'}
              balance={ethBalance}
              labelColor={currencies['eth'].color}
              name={currencies['eth'].name}
              imageSource={currencies['eth'].icon}
              vertical={true}
              withAdd={true}
              onPress={() => this.handleFunding('ETH')}
            />
            <Currency
              abbreviation={'OGN'}
              balance={ognBalance}
              labelColor={currencies['ogn'].color}
              name={currencies['ogn'].name}
              imageSource={currencies['ogn'].icon}
              vertical={true}
              onPress={() => this.handleFunding('OGN')}
            />
            {/*
            <Currency
              abbreviation={'DAI'}
              balance={dai}
              labelColor={currencies['dai'].color}
              name={currencies['dai'].name}
              imageSource={currencies['dai'].icon}
              vertical={true}
              onPress={() => this.handleFunding('DAI')}
            />
            */}
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Show Private Key'}
              onPress={() => Alert.alert('Private Key', privateKey)}
            />
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Copy Private Key'}
              onPress={() => this.handleDangerousCopy(privateKey)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return {
    wallet,
  }
}

export default connect(mapStateToProps)(WalletModal)

const styles = StyleSheet.create({
  address: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
  },
  addressContainer: {
    paddingHorizontal: 18 * 3,
    paddingVertical: 22,
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 10,
  },
  buttonsContainer: {
    paddingTop: 10,
  },
  close: {
    margin: 'auto',
  },
  container: {
    backgroundColor: '#0b1823',
    flex: 1,
  },
  heading: {
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: 17,
    marginVertical: 'auto',
    textAlign: 'center',
  },
  nav: {
    height: 44,
    flexDirection: 'row',
  },
  navHeadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  navImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18 * 3,
  },
  svContainer: {
    flex: 1,
  },
  walletSVContainer: {
    paddingHorizontal: 10,
  },
})
