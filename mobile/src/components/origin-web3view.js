'use strict'

/* Implements Origin specific handling of web3 calls, include meta transactions
 * using web3view.
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Modal, Platform, StyleSheet } from 'react-native'
import { ethers } from 'ethers'
import SafeAreaView from 'react-native-safe-area-view'
import PushNotification from 'react-native-push-notification'
import get from 'lodash.get'
import RNSamsungBKS from 'react-native-samsung-bks'

import { decodeTransaction } from 'utils/contractDecoder'
import { isValidMetaTransaction } from 'utils/user'
import Web3View from 'components/web3view'
import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'

const OriginWeb3View = React.forwardRef((props, ref) => {
  const [transactionCardLoading, setTransactionCardLoading] = useState(false)
  const [modals, setModals] = useState([])

  // TODO use the HOC, need to get forwardRef working through HOC
  const isSamsungBKS =
    Platform.OS === 'android' &&
    get(props, 'samsungBKS.seedHash', '').length > 0 &&
    props.wallet.activeAccount.hdPath

  /* Sign a message. Uses Samsung BKS if it is enabled or uses ethers and the
   * local wallet cache.
   */
  const _signMessage = async messageToSign => {
    if (isSamsungBKS) {
      return await RNSamsungBKS.signEthPersonalMessage(
        props.wallet.activeAccount.hdPath,
        messageToSign
      )
    } else {
      const wallet = new ethers.Wallet(props.wallet.activeAccount.privateKey)
      return await wallet.signMessage(messageToSign)
    }
  }

  const _sendTransaction = async () => {
    console.debug('Sending a transaction')
  }

  const _signTransaction = async () => {
    if (isSamsungBKS) {
      console.debug('Signing a transaction with Samsung BKS')
    } else {
      console.debug('Signing a transaction with local wallet cache')
    }
  }

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
  const onSignPersonalMessage = async (callback, msgData) => {
    // Personal sign is typically for handling meta transaction requests
    const decodedData = JSON.parse(ethers.utils.toUtf8String(msgData.data.data))
    const decodedTransaction = decodeTransaction(decodedData.txData)
    // If the transaction validate the sha3 hash and sign that for the relayer
    if (isValidMetaTransaction(decodedTransaction)) {
      console.debug(
        `Got meta transaction for ${decodedTransaction.functionName} on ${decodedTransaction.contractName}`
      )
      const dataToSign = ethers.utils.arrayify(ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes', 'uint256'],
        [decodedData.from, decodedData.to, 0, decodedData.txData, decodedData.nonce]
      ))
      const signature = await _signMessage(dataToSign)
      callback(signature)
    } else {
      // Not a meta transaction, display a modal prompting the user
      onWeb3Call(callback, msgData)
    }
  }

  /* Generic Web3 request handler which displays a prompt to the user. This is
   * resposible for hanlding signMessage and processTransaction web3 calls.
   */
  const onWeb3Call = (callback, msgData) => {
    console.debug(`Got web3 call to ${msgData.targetFunc}`)
    const { functionName, contractName } = decodeTransaction(msgData.data.data)
    if (functionName && contractName) {
      console.debug(`Contract method is ${functionName} on ${contractName}`)
    }

    PushNotification.checkPermissions(async permissions => {
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

      if (isSamsungBKS) {
        if (
          ['signMessage', 'signPersonalMessage'].includes(msgData.targetFunc)
        ) {
          const signature = await _signMessage(msgData.data.data)
          console.debug('Got signature', signature)
          return callback(signature)
        }
        console.debug('TODO something with Samsung BKS')
      } else {
        // Not using Samsung BKS, display our own modal for the user to confirm
        // or deny the transaction
        const web3Modal = { type: msgData.targetFunc, msgData, callback }
        // Modals render in different ordering on Android/iOS so use a different
        // method of adding the modal to the array to get the notifications modal
        // to display on top of the web3 modal
        Platform.OS === 'ios'
          ? newModals.push(web3Modal)
          : newModals.unshift(web3Modal)
        // Update the state with the new modals
        setModals([...modals, ...newModals])
      }
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
    return modals.map((modal, index) => {
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
        onConfirm={async () => {
          setTransactionCardLoading(true)
          const hash = await _sendTransaction(modal.msgData.data)
          setTransactionCardLoading(false)
          toggleModal(modal, hash)
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
        onConfirm={async () => {
          const signature = await _signMessage(modal.msgData.data.data)
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

const mapStateToProps = ({ samsungBKS, wallet }) => {
  return { samsungBKS, wallet }
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
