'use strict'

const autocannon = require('autocannon')
const FormData = require('form-data')
const fs = require('fs')
const ipfsdCtl = require('ipfsd-ctl')
const logger = require('./src/logger')

const imageHash = 'QmcJwbSPxVgpLsnN3ESAeZ7FRSapYKa27pWFhY9orsZat7'
const ipfsFactory = ipfsdCtl.create({
  type: 'js'
})
require('./src/app')

async function spawnIpfs() {
  return new Promise((resolve, reject) => {
    ipfsFactory.spawn(
      {
        disposable: true,
        defaultAddrs: true
      },
      (err, node) => {
        if (err) {
          reject(err)
        }
        node.api.util.addFromFs('./fixtures/sample_1mb.jpg')
        resolve(node)
      }
    )
  })
}

async function loadTest(url, requests = []) {
  const ipfsNode = await spawnIpfs()
  let autocannonInstance

  return new Promise((resolve, reject) => {
    autocannonInstance = autocannon(
      {
        url: url,
        connections: 10,
        pipelining: 1,
        duration: 30,
        requests: requests
      },
      (err, res) => {
        if (err) {
          logger.error(err)
          reject(err)
        }
        ipfsNode.stop()
        resolve(res)
      }
    )

    autocannon.track(autocannonInstance, {
      renderLatencyTable: true
    })

    process.once('SIGINT', () => {
      autocannonInstance.stop()
    })
  })
}

async function main() {
  const fileBuffer = fs.readFileSync('./fixtures/sample_1mb.jpg')
  const formData = new FormData()
  formData.append('image', fileBuffer)

  const downloadRequest = {
    method: 'GET',
    path: `/ipfs/${imageHash}`,
    headers: {}
  }

  // const uploadRequest = {
  //  method: 'POST',
  //  path: '/api/v0/add',
  //  body: formData.toString(),
  //  headers: formData.getHeaders()
  // }

  logger.debug('Starting load test of IPFS node')
  await loadTest(`http://localhost:9090/ipfs/${imageHash}`, [downloadRequest])
  // See https://github.com/OriginProtocol/origin/issues/794
  // await loadTest(`http://localhost:5002/api/v0/add`, [uploadRequest])
  logger.debug('Load test of IPFS node complete')

  logger.debug('Starting load test of origin-ipfs-proxy')
  await loadTest(`http://localhost:9999/ipfs/${imageHash}`, [downloadRequest])
  // See https://github.com/OriginProtocol/origin/issues/794
  // await loadTest(`http://localhost:9999/api/v0/add`, [uploadRequest])
  logger.debug('Load test of origin-ipfs-proxy complete')

  process.exit()
}

main()
