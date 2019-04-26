const FormData = require('form-data')
const fetch = require('cross-fetch')

import contracts from '../contracts'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import { setNetwork, shutdown } from '../contracts'

setNetwork(process.env.NETWORK || 'test')

//
// Backfill script to store old avatars as data urls into IPFS
//
// - Reads down a profile, extracts the image, and posts it to IPFS
// - Checks the the calculated hash matches the actual uploaded hash
// - Single threaded for maximum obviousness and robustness
// - Should only need to be run once per environment,
//   since our active code is already storing new avatars the new way.
//

const statusCounters = {}
let uploadCount = 0

async function backfillAvatarToIpfs() {
  console.log('Loading events.....')
  const events = await contracts.identityEvents.eventCache.allEvents()
  const accountIpfs = {}

  events.forEach(event => {
    const account = event.returnValues.account
    if (accountIpfs[account] === undefined) {
      accountIpfs[account] = []
    }
    if (event.event === 'IdentityUpdated') {
      accountIpfs[account].push(event.returnValues.ipfsHash)
    } else if (event.event === 'IdentityDeleted') {
      // We want to forget everything that was uploaded before a delete
      accountIpfs[account] = []
    }
  })

  for (const account in accountIpfs) {
    for (const identityIpfsHash of accountIpfs[account]) {
      console.log(
        'Starting Profile',
        originIpfs.getIpfsHashFromBytes32(identityIpfsHash)
      )
      console.log(' for account', account)
      const data = await originIpfs.get(contracts.ipfsGateway, identityIpfsHash)
      if (!data) {
        showStatus('FAIL: Failed to fetch identity IPFS data')
        continue
      }
      if (data.profile === undefined) {
        showStatus('SKIP: No profile')
        continue
      }
      if (data.profile.avatarUrl) {
        showStatus('SKIP: Already using new avatarUrl')
        continue
      }
      if (data.profile.avatar === undefined || data.profile.avatar === '') {
        showStatus('SKIP: No avatar')
        continue
      }
      if (!data.profile.avatar.startsWith('data:')) {
        showStatus('SKIP: Not data url for avatar')
        continue
      }
      const { buffer, mimeType } = dataURItoBinary(data.profile.avatar)
      if (buffer.length == 0) {
        showStatus('SKIP: Not actual data in data url for avatar')
        continue
      }
      const calculatedUrl = await IpfsHash.of(Buffer.from(buffer))
      console.log('', mimeType, buffer.length)
      const actualUrl = await postFile(contracts.ipfsRPC, buffer, mimeType)
      console.log('', 'saved as ', `${contracts.ipfsGateway}/ipfs/${actualUrl}`)

      if (actualUrl != calculatedUrl) {
        showStatus('FAIL: Calculated IPFS does not match upload')
        console.error(calculatedUrl, actualUrl)
        continue
      }
      showStatus('SUCCESS: Avatar uploaded to IPFS')
    }
  }
  console.log('------------------------------------')
  console.log('Run completed - Status totals below:')
  console.log(statusCounters)

  shutdown()
}

function showStatus(status) {
  if (statusCounters[status] == undefined) {
    statusCounters[status] = 0
  }
  statusCounters[status] += 1
  uploadCount += 0
  console.log(uploadCount, status)
  uploadCount += 1
}

async function postFile(ipfsRPC, buffer, mimeType) {
  const body = new FormData()
  body.append('file', buffer, { contentType: mimeType, filename: 'blob' })
  const rawRes = await fetch(`${ipfsRPC}/api/v0/add`, { method: 'POST', body })
  if (rawRes.status != 200) {
    console.log(rawRes)
    console.error(rawRes.text())
    throw 'Upload failed'
  }
  const res = await rawRes.json()
  return res.Hash
}

function dataURItoBinary(dataURI) {
  const parts = dataURI.split(',')
  const buffer = Buffer.from(parts[1], 'base64')
  const mimeType = parts[0].split(':')[1].split(';')[0]
  return { buffer, mimeType }
}

backfillAvatarToIpfs()
