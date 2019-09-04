'use strict'

/* Implements Origin specific handling of web3 calls, include meta transactions
 * using web3view.
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Sentry } from 'react-native-sentry'
import { Modal, Platform, StyleSheet } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import PushNotification from 'react-native-push-notification'

import { decodeTransaction } from 'utils/contractDecoder'
import { isValidMetaTransaction } from 'utils/user'
import Web3View from 'components/web3view'
import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'

const OriginWeb3View = React.forwardRef((props, ref) => {
  const [transactionCardLoading, setTransactionCardLoading] = useState(false)
  const [modals, setModals] = useState([])

  /* Web3 getAccounts request. Returns a list of accounts from the local cache.
   */
  const onGetAccounts = callback => {
    const { wallet } = props
    // Calculated state of accounts by placing activeAccount at the front
    // of the accounts array
    let result
    if (wallet.activeAccount) {
      const filteredAccounts = wallet.accounts.filter(
        a => a.address !== wallet.activeAccount.address
      )
      result = [
        wallet.activeAccount.address,
        ...filteredAccounts.map(a => a.address)
      ]
    } else {
      result = wallet.accounts.map(a => a.address)
    }
    callback(result)
  }

  /* Web3 signPersonalMessage request. If it is a valid meta transaction
   * the app signs this transaction transparently so the user does not have to
   * intervene. If it is not a valid meta transaction it displays the request
   * to the user.
   */
  const onSignPersonalMessage = (callback, msgData) => {
    const { wallet } = props
    // Personal sign is for handling meta transaction requests
    const decodedData = JSON.parse(
      global.web3.utils.hexToUtf8(msgData.data.data)
    )
    const decodedTransaction = decodeTransaction(decodedData.txData)
    // If the transaction validate the sha3 hash and sign that for the relayer
    if (isValidMetaTransaction(decodedTransaction)) {
      const dataToSign = global.web3.utils.soliditySha3(
        { t: 'address', v: decodedData.from },
        { t: 'address', v: decodedData.to },
        { t: 'uint256', v: global.web3.utils.toWei('0', 'ether') },
        { t: 'bytes', v: decodedData.txData },
        { t: 'uint256', v: decodedData.nonce }
      )
      // Sign it
      const { signature } = global.web3.eth.accounts.sign(
        dataToSign,
        wallet.activeAccount.privateKey
      )
      callback(true, signature)
      console.debug('Got meta transaction: ', decodedTransaction)
    } else {
      const errorMessage = `Invalid meta transaction ${decodedTransaction.functionName}`
      console.warn(errorMessage)
      Sentry.captureMessage(errorMessage)
    }
  }

  /* Generic Web3 request handler which displays a prompt to the user. This is
   * resposible for hanlding signMessage and processTransaction web3 calls.
   */
  const onWeb3Call = (callback, msgData) => {
    const { functionName } = decodeTransaction(msgData.data.data)
    // Bump the gas for swapAndMakeOffer by 10% to handle out of gas failures caused
    // by the proxy contract
    // TODO find a better way to handle this
    // https://github.com/OriginProtocol/origin/issues/2771
    if (functionName === 'swapAndMakeOffer') {
      msgData.data.gas =
        '0x' +
        Math.ceil(
          parseInt(msgData.data.gas) + parseInt(msgData.data.gas) * 0.1
        ).toString(16)
    }

    PushNotification.checkPermissions(permissions => {
      const newModals = []
      // Check if the user has enabled push notifications and prompt them
      // to do so if they have not and it is not just a simple identity update
      if (
        !__DEV__ &&
        !permissions.alert &&
        msgData.targetFunc === 'processTransaction' &&
        functionName !== 'emitIdentityUpdated'
      ) {
        newModals.push({ type: 'enableNotifications' })
      }
      // Transaction/signature modal
      const web3Modal = { type: msgData.targetFunc, msgData, callback }
      // Modals render in different ordering on Android/iOS so use a different
      // method of adding the modal to the array to get the notifications modal
      // to display on top of the web3 modal
      Platform.OS === 'ios'
        ? newModals.push(web3Modal)
        : newModals.unshift(web3Modal)
      // Update the state with the new modals
      setModals([...modals, ...newModals])
    })
  }

  /* Calls the callback from web3view with the result and closes the modal.
   */
  const toggleModal = (modal, result) => {
    if (!modal) return
    if (modal.callback) {
      modal.callback(result)
    }
    setModals([...modals.filter(m => m !== modal)])
  }

  /* Renders any modals in the state. These are displayed if a transaction
   * requires user intervention.
   */
  const renderModals = () => {
    modals.map((modal, index) => {
      let card
      if (modal.type === 'enableNotifications') {
        // This is not a web3 call but a prompt to enable notifications if
        // the user does not have it enabled.
        card = renderNotificationCard(modal)
      } else if (modal.type === 'processTransaction') {
        card = renderTransactionCard(modal)
      } else if (modal.type === 'signMessage') {
        card = renderSignatureCard(modal)
      }

      return (
        <Modal
          key={index}
          animationType="fade"
          transparent={true}
          visible={true}
          onRequestClose={() => {
            toggleModal(modal)
          }}
        >
          <SafeAreaView style={styles.modalSafeAreaView}>{card}</SafeAreaView>
        </Modal>
      )
    })
  }

  const renderNotificationCard = modal => {
    return <NotificationCard onRequestClose={() => toggleModal(modal)} />
  }

  const renderTransactionCard = modal => {
    return (
      <TransactionCard
        msgData={modal.msgData}
        fiatCurrency={this.state.fiatCurrency}
        onConfirm={() => {
          setTransactionCardLoading(true)
          global.web3.eth
            .sendTransaction(modal.msgData.data)
            .on('transactionHash', hash => {
              setTransactionCardLoading(false)
              toggleModal(modal, hash)
            })
        }}
        loading={transactionCardLoading}
        onRequestClose={() =>
          toggleModal(modal, {
            message: 'User denied transaction signature'
          })
        }
      />
    )
  }

  const renderSignatureCard = modal => {
    const { wallet } = props
    return (
      <SignatureCard
        msgData={modal.msgData}
        onConfirm={() => {
          const { signature } = global.web3.eth.accounts.sign(
            modal.msgData.data.data,
            wallet.activeAccount.privateKey
          )
          toggleModal(modal, signature)
        }}
        onRequestClose={() =>
          toggleModal(modal, {
            message: 'User denied transaction signature'
          })
        }
      />
    )
  }

  return (
    <>
      <Web3View
        ref={ref}
        onGetAccounts={onGetAccounts}
        onSignMessage={onWeb3Call}
        onSignPersonalMessage={onSignPersonalMessage}
        onProcessTransaction={onWeb3Call}
        {...props}
      />

      {renderModals()}
    </>
  )
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(
  mapStateToProps,
  null,
  null,
  {
    forwardRef: true
  }
)(OriginWeb3View)

const styles = StyleSheet.create({
  modalSafeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
})
