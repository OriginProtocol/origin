#!/usr/bin/env node
const querystring = require('querystring')
const http = require('http')
const https = require('https')
const readline = require('readline')
const arrayFunctions = require('./../../../origin-js/src/utils/arrayFunctions')


// Configuration
const elasticAddress = 'localhost:9200'
const isHttps = false
// End of Configuration

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function executeGetRequest(uri) {
  return new Promise((resolve, reject) => {
    const httpObject = isHttps ? https : http
    httpObject.get(`${isHttps ? 'https' : 'http'}://${elasticAddress}/${uri}`, (resp) => {
      let data = ''

      resp.on('data', (chunk) => {
        data += chunk
      })

      resp.on('end', () => {
        resolve(data)
      })

    }).on("error", (err) => {
      console.error("Error: " + err.message)
      reject(err.message)
    })
  })
}

function printUsage(){
  console.log('\x1b[44m%s\x1b[0m', 'Elasticsearh migration tool.')
  console.log(
`1 show status
9 show usage`
  )
}

async function showStatus(){
  const mapping = JSON.parse(await executeGetRequest('_mapping'))
  const indexes = Object.keys(mapping)

  /* Gives alias output where each index has a list of its aliases. Example:
   * { listingsIndex: [ 'listings', 'listingsNew' ] }
   * where listings & listingsNew are aliases. 
   */
  const aliases = 
    arrayFunctions.mapValues(
      arrayFunctions.groupBy((await executeGetRequest('_cat/aliases'))
        .split('\n')
        .filter(listingRow => listingRow.length > 1) // filter out empty rows
        .map(listingRow => {
          const aliasData = listingRow.split(' ')
          return {
            index: aliasData[1],
            alias: aliasData[0]
          }
        }), (nonGruopedItem) => nonGruopedItem.index)
    , valuesToBeMapped => valuesToBeMapped.map(aliasObject => aliasObject.alias))

  const docCounts = (await Promise.all(indexes
    .map(async index => executeGetRequest(`${index}/_stats/docs`))
  )).map(docCountResponse => JSON.parse(docCountResponse)._all.total.docs.count)

  let count = 0
  const paddingSize = 25
  console.log()
  console.log('\x1b[45m%s\x1b[0m', 'Index name'.padEnd(paddingSize) + 'Document Count'.padEnd(paddingSize) +  'Aliases'.padEnd(paddingSize))
  indexes.forEach((indexName, position) => {
    const alias = aliases[indexName] === undefined ? '' : aliases[indexName].join(',')
    console.log(indexName.padEnd(paddingSize) + docCounts[position].toString().padEnd(paddingSize) + alias)
  })
}



(async() => {
  printUsage()
  process.stdout.write('Select option:')

  const response = rl.on('line', async (input) => {
    input = input.trim()

    if (input === '1'){
      await showStatus()
    } else if (input === '9'){
      printUsage()
    } else {
      console.log('\n\n\x1b[41m%s\x1b[0m', 'Unknown command.')
      printUsage()
    }
    process.stdout.write('Select option:')
  })

})()