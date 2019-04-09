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
        data: data || {}
      }

      // If we have callbacks give the message an id so the callbacks for the
      // correct message can be called
      if (success || error) {
        msgObj.msgId = uuid()
      }

      const msg = JSON.stringify(msgObj)

      promiseChain = promiseChain.then(function () {
        return new Promise(function (resolve, reject) {
          if (msgObj.msgId) {
            // Call the callbacks for the matching id
            callbacks[msgObj.msgId] = {
              onsuccess: success,
              onerror: error
            }
          }

          window.ReactNativeWebView.postMessage(msg, '*')

          console.debug(`WebViewBridge send succeeded: ${msg}`)
          resolve()
        })
      }).catch(function (e) {
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
      // Not encoded as JSON, safe to ignore as its not relevant
      return
    }

    if (message.args && callbacks[message.msgId]) {
      if (message.isSuccessful) {
        callbacks[message.msgId].onsuccess.apply(null, message.args);
      }
      else {
        callbacks[message.msgId].onerror.apply(null, message.args);
      }
      delete callbacks[message.msgId];
    }
  })
}
