'use strict'

/* Implements Origin specific handling of web3 calls, include meta transactions
 * using web3view.
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Modal, StyleSheet } from 'react-native'
import { ethers } from 'ethers'
import { WebView } from 'react-native-webview'
import SafeAreaView from 'react-native-safe-area-view'
import PushNotification from 'react-native-push-notification'
import RNSamsungBKS from 'react-native-samsung-bks'
import * as Sentry from '@sentry/react-native'

import { decodeTransaction } from 'utils/contractDecoder'
import { isValidMetaTransaction } from 'utils'
import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'

/* eslint-disable react/display-name */
const OriginWeb3View = React.forwardRef(({ onMessage, ...props }, ref) => {
  const [transactionCardLoading, setTransactionCardLoading] = useState(false)
  const [modals, setModals] = useState([])

  const isUsingSamsungBKS =
    props.wallet.activeAccount && props.wallet.activeAccount.hdPath

  /* Sign a message. Uses Samsung BKS if it is enabled or uses ethers and the
   * local wallet cache.
   */
  const _signMessage = async messageToSign => {
    if (typeof messageToSign === 'string') {
      messageToSign = ethers.utils.toUtf8String(messageToSign)
    }
    if (isUsingSamsungBKS) {
      // React native doesn't support passing binary data, so encode it as base64
      // string so that we can
      messageToSign = Buffer.from(messageToSign).toString('base64')
      return await RNSamsungBKS.signEthPersonalMessage(
        props.wallet.activeAccount.hdPath,
        messageToSign
      )
    } else {
      const wallet = new ethers.Wallet(props.wallet.activeAccount.privateKey)
      return await wallet.signMessage(messageToSign)
    }
  }

  const _sendTransaction = async transaction => {
    const provider = new ethers.providers.JsonRpcProvider(
      props.settings.network.provider
    )

    if (isUsingSamsungBKS) {
      console.debug('Signing transaction with Samsung BKS')
      const nonce = await provider.getTransactionCount(
        props.wallet.activeAccount.address
      )
      console.debug('Using nonce', nonce)
      const value = transaction.value ? transaction.value : 0
      const signedTransaction = await RNSamsungBKS.signEthTransaction(
        props.wallet.activeAccount.hdPath,
        ethers.utils.bigNumberify(nonce).toString(),
        ethers.utils.bigNumberify(transaction.gasPrice).toString(),
        ethers.utils.bigNumberify(transaction.gasLimit).toString(),
        transaction.to,
        ethers.utils.bigNumberify(value).toString(),
        transaction.data
      )
      console.debug('Sending transaction via provider')
      return await provider.sendTransaction(signedTransaction)
      // Return hash
    } else {
      const wallet = new ethers.Wallet(
        props.wallet.activeAccount.privateKey,
        provider
      )
      console.debug('Sending transaction with local wallet cache')
      return await wallet.sendTransaction(transaction)
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
      result = [
        wallet.activeAccount.address,
        ...wallet.accounts
          .filter(a => a.address !== wallet.activeAccount.address)
          .map(a => a.address)
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

      const dataToSign = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes', 'uint256'],
          [
            decodedData.from,
            decodedData.to,
            0,
            decodedData.txData,
            decodedData.nonce
          ]
        )
      )

      const signature = await _signMessage(dataToSign)
      callback(signature)

      checkNotificationPermissions()
    } else {
      // Not a meta transaction, display a modal prompting the user
      onWeb3Call(callback, msgData)
    }
  }

  /* Generic Web3 request handler which displays a prompt to the user. This is
   * resposible for hanlding signMessage and processTransaction web3 calls.
   */
  const onWeb3Call = async (callback, msgData) => {
    console.debug(`Got web3 call to ${msgData.targetFunc}`)

    // Decode the transaction and print some debugging information
    const { functionName, contractName } = decodeTransaction(msgData.data.data)
    if (functionName && contractName) {
      console.debug(`Contract method is ${functionName} on ${contractName}`)
    }

    // Message signing via Samsung BKS no need to pop the modal here because
    // we don't add any useful information
    if (
      isUsingSamsungBKS &&
      ['signMessage', 'signPersonalMessage'].includes(msgData.targetFunc)
    ) {
      return callback(await _signMessage(msgData.data.data))
    }

    // Dispay a modal for the user to accept or reject the transaction. The
    // transaction confirmation will be passed to Samsung BKS if it is used
    setModals([...modals, { type: msgData.targetFunc, msgData, callback }])
  }

  const checkNotificationPermissions = () => {
    // Check if the user has enabled push notifications
    return PushNotification.checkPermissions(permissions => {
      if (!permissions.alert) {
        setModals([...modals, { type: 'enableNotifications' }])
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
          onRequestClose={() => toggleModal(modal)}
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
          const data = modal.msgData.data
          let transaction
          try {
            transaction = await _sendTransaction({
              to: data.to,
              value: data.value,
              gasLimit: data.gasLimit,
              gasPrice: data.gasPrice,
              data: data.data
            })
          } catch (error) {
            Sentry.captureException(error)
            toggleModal(modal, {
              message: 'User denied transaction signature'
            })
          }
          console.debug('Got transaction hash', transaction.hash)
          setTransactionCardLoading(false)
          toggleModal(modal, transaction.hash)
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

  const onWebViewMessage = async event => {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      if (onMessage) onMessage(event)
      return
    }

    if (onMessage) onMessage(msgData)

    const callback = result => {
      msgData.isSuccessful = Boolean(result)
      msgData.args = [result]
      if (ref) {
        ref.current.postMessage(JSON.stringify(msgData))
      }
    }

    if (msgData.targetFunc === 'getAccounts') {
      onGetAccounts(callback)
    } else if (msgData.targetFunc === 'signMessage') {
      onWeb3Call(callback, msgData)
    } else if (msgData.targetFunc === 'signPersonalMessage') {
      onSignPersonalMessage(callback, msgData)
    } else if (msgData.targetFunc === 'processTransaction') {
      onWeb3Call(callback, msgData)
    }
  }

  return (
    <>
      <WebView ref={ref} onMessage={onWebViewMessage} {...props} />
      {renderModals()}
    </>
  )
})

const mapStateToProps = ({ samsungBKS, settings, wallet }) => {
  return { samsungBKS, settings, wallet }
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
