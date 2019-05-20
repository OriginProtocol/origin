const FormData = require('form-data')
const fetch = require('cross-fetch')
const chunk = require('lodash/chunk')

import contracts from '../contracts'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import { setNetwork, shutdown } from '../contracts'

setNetwork(process.env.NETWORK || 'test')

// Allows you to backfill only a single account
const ONLY_ACCOUNT = process.env.ONLY_ACCOUNT

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
const CONCURRENCY = 10

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

  const tasks = []
  for (const account in accountIpfs) {
    for (const identityIpfsHash of accountIpfs[account]) {
      if (ONLY_ACCOUNT !== undefined && ONLY_ACCOUNT != account) {
        continue
      }
      tasks.push({ account, identityIpfsHash })
    }
  }

  for (const chunklet of chunk(tasks, CONCURRENCY)) {
    await Promise.all(
      chunklet.map(task => {
        return (async () => {
          const { account, identityIpfsHash } = task
          const logs = await backfillProfileIpfs(account, identityIpfsHash)
          console.log(logs)
        })()
      })
    )
  }

  console.log('------------------------------------')
  console.log('Run completed - Status totals below:')
  console.log(statusCounters)

  shutdown()
}

async function backfillProfileIpfs(account, identityIpfsHash) {
  const logs = []
  logs.push(
    `Starting Profile ${originIpfs.getIpfsHashFromBytes32(identityIpfsHash)}`
  )
  logs.push(` for account ${account}`)
  const data = await originIpfs.get(contracts.ipfsGateway, identityIpfsHash)
  if (!data) {
    logs.push(showStatus('FAIL: Failed to fetch identity IPFS data'))
    return logs
  }
  if (data.profile === undefined) {
    logs.push(showStatus('SKIP: No profile'))
    return logs
  }
  if (data.profile.avatarUrl) {
    logs.push(showStatus('SKIP: Already using new avatarUrl'))
    return logs
  }
  if (data.profile.avatar === undefined || data.profile.avatar === '') {
    logs.push(showStatus('SKIP: No avatar'))
    return logs
  }
  if (!data.profile.avatar.startsWith('data:')) {
    logs.push(showStatus('SKIP: Not data url for avatar'))
    return logs
  }
  const { buffer, mimeType } = dataURItoBinary(data.profile.avatar)
  if (buffer.length == 0) {
    logs.push(showStatus('SKIP: Not actual data in data url for avatar'))
    return logs
  }
  const calculatedUrl = await IpfsHash.of(Buffer.from(buffer))
  logs.push(`  ${mimeType} ${buffer.length}`)
  const actualUrl = await postFile(contracts.ipfsRPC, buffer, mimeType)
  logs.push(`  saved as ${contracts.ipfsGateway}/ipfs/${actualUrl}`)

  if (actualUrl != calculatedUrl) {
    logs.push(`FAIL: Calculated IPFS does not match upload`)
    console.error(calculatedUrl, actualUrl)
    return logs
  }
  logs.push(showStatus('SUCCESS: Avatar uploaded to IPFS'))
  return logs
}

function showStatus(status) {
  if (statusCounters[status] == undefined) {
    statusCounters[status] = 0
  }
  statusCounters[status] += 1
  const output = `${uploadCount} ${status}`
  uploadCount += 1
  return output
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
