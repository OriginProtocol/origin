'use strict'

import uuid from 'uuid/v1'

let promiseChain = Promise.resolve()

const promises = {}
const callbacks = {}

export default function() {
  window.webViewBridge = {
    /**
     * send message to the React-Native WebView onMessage handler
     * @param targetFunc - name of the function to invoke on the React-Native side
     * @param data - data to pass
     * @param success - success callback
     * @param error - error callback
     */
    send: function(targetFunc, data, success, error) {
      success = success || function() {}
      error = error || function () {}

      const msgObj = {
        targetFunc: targetFunc,
        data: data || {},
        msgId: uuid(),
      }

      const msg = JSON.stringify(msgObj)

      promiseChain = promiseChain.then(function () {
        return new Promise(function (resolve, reject) {
          promises[msgObj.msgId] = {resolve: resolve, reject: reject}

          callbacks[msgObj.msgId] = {
            onsuccess: success,
            onerror: error
          }

          window.ReactNativeWebView.postMessage(msg)
        })
      }).catch(function (e) {
        alert(e)
        console.error(`WebViewBridge send failed ${e.message}`)
      })
    },
  }

  window.addEventListener('message', function(e) {
    let message
    try {
      message = JSON.parse(e.data)
    }
    catch(e) {
      console.log(`Failed to parse WebViewBridge message: ${e.message}`)
      return
    }

    if (promises[message.msgId]) {
      promises[message.msgId].resolve();
      delete promises[message.msgId];
    }

    if (message.args && callbacks[message.msgId]) {
      if (message.isSuccessfull) {
        callbacks[message.msgId].onsuccess.apply(null, message.args);
      }
      else {
        callbacks[message.msgId].onerror.apply(null, message.args);
      }
      delete callbacks[message.msgId];
    }
  })
}

