#!/usr/bin/env node

/**
 * CLI for managing Elastic Search indices.
 *
 */

require('dotenv').config()

try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const http = require('http')
const https = require('https')
const readline = require('readline')

// Configuration
let host = 'localhost'
let port = '9200'
if (process.env.ELASTICSEARCH_HOST) {
  const splits = process.env.ELASTICSEARCH_HOST.split(':')
  host = splits[0]
  port = splits[1]
}
const isHttps = false

console.log(`Elasticsearch host config: ${host}:${port}`)

// Freely alter index below
const index = {
  mappings: {
    listing: {
      properties: {
        'price.amount': { type: 'double' },
        'price.currency': { type: 'text' },
        commission: { type: 'double' },
        commissionPerUnit: { type: 'double' },
        unitsTotal: { type: 'integer' },
        language: { type: 'keyword' },
        listingType: { type: 'keyword' },
        status: { type: 'keyword' },
        marketplacePublisher: { type: 'keyword' },
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

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `collection` thru `iteratee`.
 *
 * @param  {Array} collection The collection to iterate over.
 * @param  {Function} iteratee The iteratee to transform keys.
 * @return {Object} Returns the composed aggregate object.
 */
function groupBy(collection, iteratee) {
  return collection.reduce(function(accumulator, element) {
    const key = iteratee(element)
    accumulator[key] = accumulator[key] || []
    accumulator[key].push(element)
    return accumulator
  }, Object.create(null))
}

/**
 * Applies transformation function to values of an object while preserving keys
 *
 * @param  {Object} object to iterate over
 * @param  {Function} mapFunction The functino that transforms the value
 * @return {Object} Returns the transformed object
 */
function mapValues(object, mapFunction) {
  if (
    object === null ||
    object === undefined ||
    Object.keys(object).length === 0
  )
    return {}

  return Object.assign(
    ...Object.keys(object).map(k => ({ [k]: mapFunction(object[k]) }))
  )
}

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

    const postReq = http.request(options, function(res) {
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
  console.log(`
    Usage:
    es-cli.js createIndex [indexName]
    es-cli.js deleteIndex [indexName]
    es-cli.js -i   --> interactive mode
  `)
}

function printInteractiveUsage() {
  console.log('\x1b[44m%s\x1b[0m', 'Elasticsearch devops tool.')
  console.log(`1 show index info
2 create index (with mappings defined in configuration)
3 create alias
4 delete alias
5 delete index
6 reindex
9 show usage`)
}

async function showIndexInfo() {
  const mapping = JSON.parse(await executeGetRequest('_mapping'))
  const indexes = Object.keys(mapping)

  /* Gives alias output where each index has a list of its aliases. Example:
   * { listingsIndex: [ 'listings', 'listingsNew' ] }
   * where listings & listingsNew are aliases.
   */
  const aliases = mapValues(
    groupBy(
      (await executeGetRequest('_cat/aliases'))
        .split('\n')
        .filter(listingRow => listingRow.length > 1) // filter out empty rows
        .map(listingRow => {
          const aliasData = listingRow.split(/\s+/)
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

  const res = await createIndexWithName(indexName)

  console.log('Response: ', res)
}

async function createIndexWithName(indexName) {
  return await executePayloadRequest(indexName, JSON.stringify(index), 'PUT')
}

async function validateCliResponse(callback, args, validationPredicate) {
  const response = await callback(...args)
  if (validationPredicate(response)) {
    return
  }
  console.error('Unexpected response: ', response)
  process.exit(1)
}

async function deleteIndex() {
  process.stdout.write('Index to delete: ')
  const indexName = await waitForInput()

  console.log(`Are you sure you want to delete ${indexName}?`)
  process.stdout.write('[y/n]: ')
  const answer = await waitForInput()

  if (answer.toLowerCase() === 'y') {
    const res = await deleteIndexWithName(indexName)
    console.log('Response: ', res)
  }
}

async function deleteIndexWithName(indexName) {
  return await executePayloadRequest(indexName, null, 'DELETE')
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
  return new Promise(resolve => {
    inputResolveCallback = resolve
  })
}

// eslint-disable-next-line no-extra-semi
;(async () => {
  if (process.argv[2] === 'createIndex' && process.argv.length === 4) {
    const indexName = process.argv[3]
    await validateCliResponse(createIndexWithName, [indexName], response => {
      // Don't error if success or if index already exists
      return (
        JSON.parse(response).acknowledged === true ||
        JSON.parse(response).error.type === 'resource_already_exists_exception'
      )
    })
    console.log(`Index ${indexName} created!`)
    process.exit(0)
  } else if (process.argv[2] === 'deleteIndex' && process.argv.length === 4) {
    const indexName = process.argv[3]
    await validateCliResponse(deleteIndexWithName, [indexName], response => {
      return JSON.parse(response).acknowledged === true
    })
    console.log(`Index ${indexName} deleted!`)
    process.exit(0)
  }
  // interactive mode
  else if (process.argv[2] === '-i' && process.argv.length === 3) {
    printInteractiveUsage()
    process.stdout.write('Select option: ')

    rl.on('line', async input => {
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
        printInteractiveUsage()
      } else {
        console.log('\n\n\x1b[41m%s\x1b[0m', 'Unknown command.')
        printInteractiveUsage()
      }
      process.stdout.write('Select option: ')
    })
  } else {
    printUsage()
    process.exit(0)
  }
})()
