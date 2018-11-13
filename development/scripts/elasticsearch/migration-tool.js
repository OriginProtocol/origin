#!/usr/bin/env node

const querystring = require('querystring')
const http = require('http')
const https = require('https')
const readline = require('readline')
const arrayFunctions = require('./../../../origin-js/src/utils/arrayFunctions')

// Configuration
const host = 'localhost'
const port = '9200'
const isHttps = false

// Freely alter index below
const index = {
  mappings: {
    listing: {
      properties: {
        'price.amount': { type: 'double' },
        'price.currency': { type: 'text' },
        'commission.amount': { type: 'double' },
        'commission.currency': { type: 'text' },
        'securityDeposit.amount': { type: 'double' },
        'securityDeposit.currency': { type: 'text' },
        unitsTotal: { type: 'integer' },
        language: { type: 'keyword' },
        listingType: { type: 'keyword' },
        status: { type: 'keyword' },
        category: { type: 'keyword', copy_to: 'all_text' },
        subCategory: { type: 'keyword', copy_to: 'all_text' },
        description: { type: 'text', copy_to: 'all_text' },
        title: { type: 'text', copy_to: 'all_text' },
        all_text: { type: 'text' }
      }
    }
  }
}

// End of Configuration

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function executePayloadRequest(uri, json, method = 'POST') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port,
      method,
      path: uri,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    postReq = http.request(options, function(res) {
      res.setEncoding('utf8')
      res
        .on('data', function(data) {
          resolve(data)
        })
        .on('error', err => {
          console.error('Error: ' + err.message)
          reject(err.message)
        })
    })

    if (json) postReq.write(json)
    postReq.end()
  })
}

async function executeGetRequest(uri) {
  return new Promise((resolve, reject) => {
    const httpObject = isHttps ? https : http
    httpObject
      .get(`${isHttps ? 'https' : 'http'}://${host}:${port}/${uri}`, resp => {
        let data = ''

        resp.on('data', chunk => {
          data += chunk
        })

        resp.on('end', () => {
          resolve(data)
        })
      })
      .on('error', err => {
        console.error('Error: ' + err.message)
        reject(err.message)
      })
  })
}

function printUsage() {
  console.log('\x1b[44m%s\x1b[0m', 'Elasticsearh migration tool.')
  console.log(
    `1 show index info
2 create index (with mappings defined in configuration)
3 create alias
4 delete alias
5 delete index
6 reindex
9 show usage`
  )
}

async function showIndexInfo() {
  const mapping = JSON.parse(await executeGetRequest('_mapping'))
  const indexes = Object.keys(mapping)

  /* Gives alias output where each index has a list of its aliases. Example:
   * { listingsIndex: [ 'listings', 'listingsNew' ] }
   * where listings & listingsNew are aliases. 
   */
  const aliases = arrayFunctions.mapValues(
    arrayFunctions.groupBy(
      (await executeGetRequest('_cat/aliases'))
        .split('\n')
        .filter(listingRow => listingRow.length > 1) // filter out empty rows
        .map(listingRow => {
          const aliasData = listingRow.split(' ')
          return {
            index: aliasData[1],
            alias: aliasData[0]
          }
        }),
      nonGruopedItem => nonGruopedItem.index
    ),
    valuesToBeMapped => valuesToBeMapped.map(aliasObject => aliasObject.alias)
  )

  const docCounts = (await Promise.all(
    indexes.map(async index => executeGetRequest(`${index}/_stats/docs`))
  )).map(docCountResponse => JSON.parse(docCountResponse)._all.total.docs.count)

  let count = 0
  const paddingSize = 25
  console.log()
  console.log(
    '\x1b[45m%s\x1b[0m',
    'Index name'.padEnd(paddingSize) +
      'Document Count'.padEnd(paddingSize) +
      'Aliases'.padEnd(paddingSize)
  )
  indexes.forEach((indexName, position) => {
    const alias =
      aliases[indexName] === undefined ? '' : aliases[indexName].join(',')
    console.log(
      indexName.padEnd(paddingSize) +
        docCounts[position].toString().padEnd(paddingSize) +
        alias
    )
  })
}

async function createIndex() {
  process.stdout.write('Index to create: ')
  const indexName = await waitForInput()

  const res = await executePayloadRequest(
    indexName,
    JSON.stringify(index),
    'PUT'
  )
  console.log('Response: ', res)
}

async function deleteIndex() {
  process.stdout.write('Index to delete: ')
  const indexName = await waitForInput()

  console.log(`Are you sure you want to delete ${indexName}?`)
  process.stdout.write('[y/n]: ')
  const answer = await waitForInput()

  if (answer.toLowerCase() === 'y') {
    const res = await executePayloadRequest(indexName, null, 'DELETE')
    console.log('Response: ', res)
  }
}

async function reindex() {
  process.stdout.write('Read documents from index: ')
  const sourceIndex = await waitForInput()
  process.stdout.write('Destination index: ')
  const destinationIndex = await waitForInput()

  const res = await executePayloadRequest(
    '_reindex',
    `{"source": { "index": "${sourceIndex}" }, "dest": { "index": "${destinationIndex}" }}`
  )
  console.log('Response: ', res)
}

async function createAlias() {
  process.stdout.write('Name of the index to apply alias to: ')
  const indexName = await waitForInput()
  process.stdout.write('Name of the alias: ')
  const aliasName = await waitForInput()

  const res = await executePayloadRequest(
    '_aliases',
    `{"actions" : [{ "add" : { "index" : "${indexName}", "alias" : "${aliasName}" } }]}`
  )
  console.log('Response: ', res)
}

async function deleteAlias() {
  process.stdout.write('Name of the index to remove alias: ')
  const indexName = await waitForInput()
  process.stdout.write('Name of the alias: ')
  const aliasName = await waitForInput()

  const res = await executePayloadRequest(
    `${indexName}/_alias/${aliasName}`,
    null,
    'DELETE'
  )
  console.log('Response: ', res)
}

let inputResolveCallback = null
async function waitForInput() {
  return new Promise((resolve, reject) => {
    inputResolveCallback = resolve
  })
}

;(async () => {
  printUsage()
  process.stdout.write('Select option: ')

  const response = rl.on('line', async input => {
    input = input.trim()

    // Some other function was waiting for input. Send the value to it
    if (inputResolveCallback !== null) {
      inputResolveCallback(input)
      inputResolveCallback = null
      return
    }

    if (input === '1') {
      await showIndexInfo()
    } else if (input === '2') {
      await createIndex()
    } else if (input === '3') {
      await createAlias()
    } else if (input === '4') {
      await deleteAlias()
    } else if (input === '5') {
      await deleteIndex()
    } else if (input === '6') {
      await reindex()
    } else if (input === '9') {
      printUsage()
    } else {
      console.log('\n\n\x1b[41m%s\x1b[0m', 'Unknown command.')
      printUsage()
    }
    process.stdout.write('Select option: ')
  })
})()
