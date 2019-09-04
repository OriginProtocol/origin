'use strict'

/* A generic layer for sending web3 calls across window.postMessage between
 * DApps and react-native code.
 */

import React from 'react'
import { WebView } from 'react-native-webview'

const Web3View = React.forwardRef(({ onMessage, ...props }, ref) => {
  /* Handles messages received from the WebView via window.postMessage and if
   * it is a web3 call then calls the appropriate prop callback.
   */
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
      props.onGetAccounts(callback, msgData)
    } else if (msgData.targetFunc === 'signMessage') {
      props.onSignMessage(callback, msgData)
    } else if (msgData.targetFunc === 'signPersonalMessage') {
      props.onSignPersonalMessage(callback, msgData)
    } else if (msgData.targetFunc === 'processTransaction') {
      props.onProcessTransaction(callback, msgData)
    }
  }

  return <WebView ref={ref} onMessage={onWebViewMessage} {...props} />
})

export default Web3View
