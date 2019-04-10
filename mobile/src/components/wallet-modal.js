import React, { Component } from 'react'
import {
  Alert,
  Clipboard,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'

import { updateBackupWarningStatus } from 'actions/Activation'

import Address from 'components/address'
import Currency from 'components/currency'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { getCurrentNetwork } from 'utils/networks'
import { toDais, toOgns } from 'utils/tokens'
import { evenlySplitAddress } from 'utils/user'

import originWallet from '../OriginWallet'

const ONE_MINUTE = 1000 * 60
const IMAGES_PATH = '../../assets/images/'

class WalletModal extends Component {
  constructor(props) {
    super(props)

    this.handleDangerousCopy = this.handleDangerousCopy.bind(this)
    this.handleFunding = this.handleFunding.bind(this)
    this.showBackupWarning = this.showBackupWarning.bind(this)
    this.showPrivateKey = this.showPrivateKey.bind(this)
    this.state = {
      showBackupWarning: this.props.backupWarning
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.showBackupWarning ||
      (this.props.backupWarning && !prevProps.backupWarning)
    ) {
      this.showBackupWarning()
    }
  }

  async handleDangerousCopy(privateKey) {
    Alert.alert(
      'Important!',
      'As a security precaution, your key will be removed from the clipboard after one minute.',
      [
        {
          text: 'Got it.',
          onPress: async () => {
            await Clipboard.setString(privateKey)

            Alert.alert('Copied to clipboard!')

            setTimeout(async () => {
              const s = await Clipboard.getString()

              if (s === privateKey) {
                Clipboard.setString('')
              }
            }, ONE_MINUTE)
          }
        }
      ]
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
          {
            text: 'Show Address',
            onPress: () => {
              Alert.alert(
                'Wallet Address',
                evenlySplitAddress(address).join('\n')
              )
            }
          },
          {
            text: 'Copy Address',
            onPress: async () => {
              await Clipboard.setString(address)

              Alert.alert(
                'Copied to clipboard!',
                evenlySplitAddress(address).join('\n')
              )
            }
          }
        ]
      )
    }
  }

  showBackupWarning() {
    this.setState({ showBackupWarning: false })
    // alert will block modal from opening if not delayed
    setTimeout(() => {
      Alert.alert(
        'Important!',
        `Be sure to back up your private key so that you don't lose access to your wallet. If your device is lost or you delete this app, we won't be able to help recover your funds.`,
        [
          {
            text: `Done. Don't show me this again.`,
            onPress: () => {
              this.props.updateBackupWarningStatus(true, Date.now())
            }
          },
          {
            text: 'Show Private Key',
            onPress: () => {
              this.showPrivateKey()

              this.props.updateBackupWarningStatus(true)
            }
          }
        ]
      )
    }, 1000)
  }

  showPrivateKey() {
    const privateKey = originWallet.getPrivateKey(this.props.address)

    Alert.alert('Private Key', privateKey)
  }

  render() {
    const {
      address,
      onPress,
      visible,
      wallet,
      onRequestClose
    } = this.props
    const { dai, eth, ogn } = wallet.balances

    const ethBalance = web3.utils.fromWei(eth, 'ether')
    const daiBalance = toDais(dai)
    const ognBalance = toOgns(ogn)
    const privateKey = originWallet.getPrivateKey(address)

    return (
      <Modal
        animationType="slide"
        visible={!!visible}
        onRequestClose={() => {
          onRequestClose()
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.nav}>
            <View style={styles.navImageContainer} />
            <View style={styles.navHeadingContainer}>
              <Text style={styles.heading}>Wallet Balances</Text>
            </View>
            <TouchableOpacity
              onPress={onPress}
              style={styles.navImageContainer}
            >
              <Image
                source={require(`${IMAGES_PATH}close-icon.png`)}
                style={styles.close}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.addressContainer}>
            <Address
              address={address}
              label={'Wallet Address'}
              style={styles.address}
            />
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
              abbreviation={'DAI'}
              balance={daiBalance}
              labelColor={currencies['dai'].color}
              name={currencies['dai'].name}
              imageSource={currencies['dai'].icon}
              vertical={true}
              onPress={() => this.handleFunding('DAI')}
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
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Show Private Key'}
              onPress={this.showPrivateKey}
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
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  updateBackupWarningStatus: (bool, datetime) =>
    dispatch(updateBackupWarningStatus(bool, datetime))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletModal)

const styles = StyleSheet.create({
  address: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center'
  },
  addressContainer: {
    paddingHorizontal: 18 * 3,
    paddingVertical: 22
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 10
  },
  buttonsContainer: {
    paddingTop: 10
  },
  close: {
    margin: 'auto'
  },
  container: {
    backgroundColor: '#0b1823',
    flex: 1
  },
  heading: {
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: 17,
    marginVertical: 'auto',
    textAlign: 'center'
  },
  nav: {
    height: 44,
    flexDirection: 'row'
  },
  navHeadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  navImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18 * 3
  },
  svContainer: {
    flex: 1
  },
  walletSVContainer: {
    paddingHorizontal: 10
  }
})
