/**
 * Keeps Messaging status in sync with GraphQL cache
 */

import gql from 'graphql-tag'
import config from './contracts'

const MessagingStateQuery = gql`
  query GetMessagingState {
    messaging(id: "currentAccount") {
      id
      enabled
      synced
      syncProgress
      pubKey
      pubSig
    }
  }
`
let syncTimer

export default function messagingSync(client) {
  const msg = config.messaging
  if (!msg) {
    return
  }
  function refresh() {
    client
      .query({ query: MessagingStateQuery, fetchPolicy: 'network-only' })
      .then(() => {})
  }
  msg.events.on('initRemote', () => {
    console.log('Messaging initialized')

    msg.synced = false
    msg.syncProgress = '0%'
    syncTimer = setTimeout(() => {
      msg.synced = true
      msg.syncProgress = '100%'
      refresh()
    }, 2000)

    if (msg.global_keys && msg.global_keys.events) {
      msg.global_keys.events.on(
        'replicate.progress',
        (address, hash, entry, progress, have) => {
          // console.log('replicate.progress', address, hash, entry, progress, have, msg.global_keys._replicationStatus.buffered, msg.global_keys._replicationStatus.queued)
          console.log('replicate.progress', progress, have)
          clearTimeout(syncTimer)
          syncTimer = setTimeout(() => {
            msg.synced = true
            msg.syncProgress = '100%'
            refresh()
          }, 2000) // If no sync event in 1 second, assume we're synced
          let pct = Math.round((progress / have) * 1000) / 10
          if (pct > 99) pct = 99
          msg.syncProgress = `${pct}%`
          msg.synced = false
          refresh()
        }
      )
    }
    // msg.global_keys.events.on(
    //   'load.progress',
    //   (address, hash, entry, progress, have) => {
    //     console.log('load.progress', progress, have)
    //   }
    // )
    // // msg.global_keys.events.on('replicated', (address, length) => console.log('replicated', address, length) )
    // msg.global_keys.events.on('load', (dbname) => console.log('load', dbname) )
    // msg.global_keys.events.on('write', (address, entry, heads) =>
    //   console.log('write', address, entry, heads)
    // )
    // msg.global_keys.events.on('ready', (dbname, heads) =>
    //   console.log('ready', dbname, heads)
    // )
  })
  // msg.events.on('initRemote', () => {
  //   console.log('Init Remote')
  // })
  // msg.events.on('new', accountKey => {
  //   console.log('Messaging new', accountKey)
  // })

  // detect existing messaging account
  msg.events.on('ready', accountKey => {
    console.log('Messaging ready', accountKey)
    refresh()
  })
  msg.events.on('signedSig', () => {
    console.log('Messaging Signed Sig')
    refresh()
  })

  // detect existing messaging account
  // msg.events.on('pending_conv', conv => {
  //   console.log('Messaging pending_conv', conv)
  // })

  // detect new decrypted messages
  msg.events.on('msg', obj => {
    if (obj.decryption) {
      const { roomId, keys } = obj.decryption
      origin.messaging.initRoom(roomId, keys)
    }
    // console.log('New msg', obj)
    // this.props.addMessage(obj)
    //
    // this.debouncedFetchUser(obj.senderAddress)
  })

  // To Do: handle incoming messages when no Origin Messaging Private Key is available
  // msg.events.on('emsg', obj => {
  //   console.error('A message has arrived that could not be decrypted:', obj)
  // })
}
