'use strict'

import React from 'react'
import { Alert, Clipboard, Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import { evenlySplitAddress } from 'utils'
import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

const AccountCreatedScreen = ({ navigation, wallet }) => (
  <SafeAreaView style={styles.container}>
    <BackArrow onClick={() => navigation.goBack(null)} />
    <View style={styles.content}>
      <Image
        resizeMethod={'scale'}
        resizeMode={'contain'}
        source={require(IMAGES_PATH + 'wallet-created-icon.png')}
        style={styles.image}
      />
      <Text style={styles.title}>
        <fbt desc="AccountCreated.title">Wallet created</fbt>
      </Text>
      <Text style={styles.subtitle}>
        <fbt desc="AccountCreated.subtitle">
          Your Ethereum address and your pricvate key have been stored locally
          on this device.
        </fbt>
      </Text>
    </View>
    <View style={styles.buttonContainer}>
      <OriginButton
        size="large"
        type="primary"
        outline
        title={fbt('View Ethereum Address', 'AccountCreated.viewAddressButton')}
        onPress={() => {
          const address = wallet.activeAccount.address
          Alert.alert(
            String(fbt('Ethereum Address', 'AccountCreated.alertTitle')),
            evenlySplitAddress(address).join('\n'),
            [
              {
                text: String(fbt('Copy', 'AccountCreated.alertCopyButton')),
                onPress: async () => {
                  await Clipboard.setString(address)
                  Alert.alert(
                    String(
                      fbt('Copied to clipboard!', 'AccountCreated.alertSuccess')
                    )
                  )
                }
              },
              { text: String(fbt('OK', 'AccountCreated.alertOkButton')) }
            ]
          )
        }}
      />
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Continue', 'AccountCreated.continueButton')}
        onPress={() => {
          navigation.navigate('AccountBackup')
        }}
      />
    </View>
  </SafeAreaView>
)

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(AccountCreatedScreen)

const styles = StyleSheet.create({
  ...CommonStyles
})
