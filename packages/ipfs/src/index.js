// export function getBytes32FromIpfsHash(hash) {
//   return hash;
// }
// export function getIpfsHashFromBytes32(bytes32Hex) {
//   return bytes32Hex;
// }
const bs58 = require('bs58')
const FormData = require('form-data')
const fetch = require('cross-fetch')
const cache = {}

function getBytes32FromIpfsHash(hash) {
  return `0x${bs58
    .decode(hash)
    .slice(2)
    .toString('hex')}`
}

// Return base58 encoded ipfs hash from bytes32 hex string,
// E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
// --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"
function getIpfsHashFromBytes32(bytes32Hex) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex')
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

// async function postFile(gateway, file) {
//   const body = new FormData()
//   body.append('file', file)
//
//   const rawRes = await fetch(`${gateway}/api/v0/add`, { method: 'POST', body })
//   const res = await rawRes.json()
//   return res.Hash
// }

async function post(gateway, json, rawHash) {
  const formData = new FormData()
  let file
  if (typeof Blob === 'undefined') {
    file = Buffer.from(JSON.stringify(json))
  } else {
    file = new Blob([JSON.stringify(json)])
  }
  formData.append('file', file)

  const rawRes = await fetch(`${gateway}/api/v0/add`, {
    method: 'POST',
    body: formData
  })
  const res = await rawRes.json()
  if (rawHash) {
    return res.Hash
  } else {
    return getBytes32FromIpfsHash(res.Hash)
  }
}

// async function postEnc(gateway, json, pubKeys) {
//   const formData = new FormData()
//
//   const publicKeys = pubKeys.reduce(
//     (acc, val) => acc.concat(openpgp.key.readArmored(val).keys),
//     []
//   )
//
//   const encrypted = await openpgp.encrypt({
//     data: JSON.stringify(json),
//     publicKeys
//   })
//
//   formData.append('file', new Blob([encrypted.data]))
//
//   const rawRes = await fetch(`${gateway}/api/v0/add`, {
//     method: 'POST',
//     body: formData
//   })
//   const res = await rawRes.json()
//
//   return getBytes32FromIpfsHash(res.Hash)
// }

// async function decode(text, key, pass) {
//   const privKeyObj = openpgp.key.readArmored(key).keys[0]
//   await privKeyObj.decrypt(pass)
//
//   const decrypted = await openpgp.decrypt({
//     message: openpgp.message.readArmored(text),
//     privateKeys: [privKeyObj]
//   })
//   return decrypted.data
// }

async function getText(gateway, hashAsBytes) {
  const hash =
    hashAsBytes.indexOf('0x') === 0
      ? getIpfsHashFromBytes32(hashAsBytes)
      : hashAsBytes
  const response = await new Promise((resolve, reject) => {
    let didTimeOut = false
    const timeout = setTimeout(() => {
      didTimeOut = true
      reject()
    }, 10000)
    fetch(`${gateway}/ipfs/${hash}`)
      .then(response => {
        clearTimeout(timeout)
        if (!didTimeOut) {
          resolve(response)
        }
      })
      .catch(() => {
        clearTimeout(timeout)
        if (!didTimeOut) {
          reject()
        }
      })
  })
  if (!response) {
    return '{}'
  }
  return await response.text()
}

const queues = {}
class Queue {
  constructor() {
    this.fetching = false
    this.requestQueue = []
  }
  async isDone() {
    return new Promise(resolve => this.requestQueue.push(resolve))
  }
}

async function get(gateway, hashAsBytes) {
  // }, party) {
  if (!hashAsBytes) return null

  const reqQueue = queues[hashAsBytes] = queues[hashAsBytes] || new Queue()
  if (reqQueue.fetching) await reqQueue.isDone()
  reqQueue.fetching = true

  let text = cache[hashAsBytes]
  if (!text) {
    text = await getText(gateway, hashAsBytes)
  }
  // if (text.indexOf('-----BEGIN PGP MESSAGE-----') === 0 && party) {
  //   try {
  //     text = await decode(text, party.privateKey, party.pgpPass)
  //   } catch (e) {
  //     return { encrypted: true, decryptError: e }
  //   }
  // }
  cache[hashAsBytes] = text

  reqQueue.fetching = false
  while (reqQueue.requestQueue.length) {
    reqQueue.requestQueue.pop()()
  }

  return JSON.parse(text)
}

module.exports = {
  get,
  getText,
  post,
  getBytes32FromIpfsHash,
  getIpfsHashFromBytes32
}
