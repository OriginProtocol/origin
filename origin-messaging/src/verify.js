'use strict'

import logger from './logger'
import Web3 from 'web3'
import * as config from './config'
import fetch from 'cross-fetch'
import stringify from 'json-stable-stringify'

const web3 = new Web3(config.RPC_SERVER)

function joinConversationKey(converser1, converser2) {
  return [converser1, converser2].sort().join('-')
}

function verifyConversationSignature(keysMap) {
  return (signature, key, message, buffer) => {
    const verifyAddress = web3.eth.accounts.recover(
      buffer.toString('utf8'),
      signature
    )
    // Hopefully the last 42 is the eth address
    const ethAddress = message.id.substr(-42)
    // Only one of the two conversers can set this parameter
    if (key == message.payload.key || key == ethAddress) {
      const entry = keysMap.get(key)
      return entry.address == verifyAddress
    }
    return false
  }
}

function verifyConversers(conversee, keysMap) {
  return (o, contentObject) => {
    const checkString =
      joinConversationKey(conversee, o.parentSub) + contentObject.ts.toString()
    const verifyAddress = web3.eth.accounts.recover(
      checkString,
      contentObject.sig
    )
    const parentKey = keysMap.get(o.parentSub)
    const converseeKey = keysMap.get(conversee)

    if (
      (parentKey && verifyAddress == parentKey.address) ||
      (converseeKey && verifyAddress == keysMap.get(conversee).address)
    ) {
      logger.debug(
        `Verified conv init for ${conversee}, Signature: ${
          contentObject.sign
        }, Signed with: ${verifyAddress}`
      )
      return true
    }
    return false
  }
}

function verifyNewMessageSignature(signature, conversationId, conversationIndex, content, address) {
  const buffer = stringify({conversationId, conversationIndex, content})
  const recoveredAddress = web3.eth.accounts.recover(buffer, signature)
  return recoveredAddress = address
}



function verifyMessageSignature(keysMap, orbitGlobal) {
  return (signature, key, message, buffer) => {
    logger.debug(
      `Verify message: ${message.id}, Key: ${key}, Signature: ${signature}`
    )

    const verifyAddress = web3.eth.accounts.recover(
      buffer.toString('utf8'),
      signature
    )
    const entry = keysMap.get(key)

    const dbStore = orbitGlobal.stores[message.id]
    if (
      config.LINKING_NOTIFY_ENDPOINT &&
      dbStore &&
      dbStore.__snapshot_loaded &&
      dbStore.access.write.includes(key)
    ) {
      const value = message.payload.value
      if (value.length && value[0].emsg) {
        const receivers = dbStore.access.write
          .filter(address => address != key)
          .reduce((acc, i) => {
            acc[i] = { newMessage: true }
            return acc
          }, {})

        fetch(config.LINKING_NOTIFY_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receivers,
            token: config.LINKING_NOTIFY_TOKEN
          })
        })
      }
    }

    //only two addresses should have write access to here
    return entry.address == verifyAddress
  }
}

function verifyRegistrySignature(signature, key, message) {
  const value = message.payload.value
  const setKey = message.payload.key
  const verifyAddress = web3.eth.accounts.recover(value.msg, signature)

  if (verifyAddress == setKey && value.msg.includes(value.address)) {
    const extractedAddress = '0x' + web3.utils.sha3(value.pub_key).substr(-40)

    if (extractedAddress == value.address.toLowerCase()) {
      const verifyPhAddress = web3.eth.accounts.recover(value.ph, value.phs)
      if (verifyPhAddress == value.address) {
        logger.debug(
          `Key verified: ${
            value.msg
          }, Signature: ${signature}, Signed with, ${verifyAddress}`
        )
        return true
      }
    }
  }
  logger.error('Key verify failed...')
  return false
}

module.exports = {
  verifyConversationSignature,
  verifyConversers,
  verifyMessageSignature,
  verifyRegistrySignature,
  verifyNewMessageSignature
}
