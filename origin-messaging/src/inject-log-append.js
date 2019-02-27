'use strict'
const Entry = require('./entry')
const Clock = require('./lamport-clock')
const maxClockTimeReducer = (res, acc) => Math.max(res, acc.clock.time)

const KEY_SIGNATURES = {}

function setKeySignature(key, signature) {
  KEY_SIGNATURES[key] = signature
}

async function getSignedKey(entry) {
  const key = entry.payload.key
  const signature = KEY_SIGNATURES[key]
  if (signature) {
    delete KEY_SIGNATURES[key]
    return { signature, key }
  } else {
    throw new Error('no signature for:', key)
  }
}

function keyFromData(data) {
  return data.key
}

function injectLogAppend(log, keyFunc, signFunc) {
  log.append = async function(data, pointerCount = 1) {
    // Update the clock (find the latest clock)
    const newTime =
      Math.max(this.clock.time, this.heads.reduce(maxClockTimeReducer, 0)) + 1
    this._clock = new Clock(this.clock.id, newTime)
    // Get the required amount of hashes to next entries (as per current state of the log)
    const nexts = Object.keys(this.traverse(this.heads, pointerCount))
    // Create the entry and add it to the internal cache
    const entry = await Entry.create(
      this._storage,
      this._keystore,
      this.id,
      data,
      nexts,
      this.clock,
      keyFunc(data),
      signFunc
    )
    this._entryIndex[entry.hash] = entry
    nexts.forEach(e => (this._nextsIndex[e] = entry.hash))
    this._headsIndex = {}
    this._headsIndex[entry.hash] = entry
    // Update the length
    this._length++
    return entry
  }
}

module.exports = {
  setKeySignature,
  getSignedKey,
  keyFromData,
  injectLogAppend
}
