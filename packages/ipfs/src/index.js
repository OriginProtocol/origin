// export function getBytes32FromIpfsHash(hash) {
//   return hash;
// }
// export function getIpfsHashFromBytes32(bytes32Hex) {
//   return bytes32Hex;
// }
const bs58 = require('bs58')
const FormData = require('form-data')
const fetch = require('cross-fetch')
const memoize = require('lodash/memoize')

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

/**
 * Takes an IPFS hash url (for example: ipfs://QmUwefhweuf...12322a) and
 * returns a url to that resource on the gateway.
 * Ensures that the IPFS hash does not contain anything evil and is the correct length.
 * @param {string} gateway
 * @param {string} ipfsUrl
 * @returns {string}
 */
function gatewayUrl(gateway, ipfsUrl) {
  if (!ipfsUrl) {
    return
  }
  const match = ipfsUrl.match(/^ipfs:\/\/([A-Za-z0-9]{46})$/)
  if (match) {
    return `${gateway}/ipfs/${match[1]}`
  }
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

/**
 * Posts binary data to IPFS and return the base 58 encoded hash.
 * Throws in case of an error.
 *
 * @param {string} gateway: URL of the IPFS gateway to use.
 * @param {Buffer} buffer: binary data to upload.
 * @returns {Promise<{string}>}
 */
async function postBinary(gateway, buffer) {
  const formData = new FormData()
  formData.append('file', buffer)
  const rawRes = await fetch(`${gateway}/api/v0/add`, {
    method: 'POST',
    body: formData
  })
  const res = await rawRes.json()
  return res.Hash
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

async function getTextFn(gateway, hashAsBytes, timeoutMS) {
  const hash =
    hashAsBytes.indexOf('0x') === 0
      ? getIpfsHashFromBytes32(hashAsBytes)
      : hashAsBytes
  const response = await new Promise((resolve, reject) => {
    let didTimeOut = false
    const timeout = setTimeout(() => {
      didTimeOut = true
      reject()
    }, timeoutMS)
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
    if (didTimeOut) console.log(`Timeout when fetching ${hash}`)
  })
  if (!response) {
    return '{}'
  }
  return await response.text()
}

const getText = memoize(getTextFn, (...args) => args[1])

async function get(gateway, hashAsBytes, timeoutMS = 10000) {
  // }, party) {
  if (!hashAsBytes) return null

  const text = await getText(gateway, hashAsBytes, timeoutMS)
  // if (text.indexOf('-----BEGIN PGP MESSAGE-----') === 0 && party) {
  //   try {
  //     text = await decode(text, party.privateKey, party.pgpPass)
  //   } catch (e) {
  //     return { encrypted: true, decryptError: e }
  //   }
  // }

  return JSON.parse(text)
}

module.exports = {
  get,
  getText,
  post,
  postBinary,
  getBytes32FromIpfsHash,
  getIpfsHashFromBytes32,
  gatewayUrl
}
