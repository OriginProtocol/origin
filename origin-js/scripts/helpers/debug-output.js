const pjson = require('../../package.json')
const truffleContractAddresses = require('./contract-addresses')

/**
 * Output to console some details for debugging
 */
const debugHeader = async () => {
    console.log('\n')
    console.log('#################################################################')
    console.log('## VERSIONS')
    console.log('## --------------------------------------------------------------')
    console.log(`## origin-js: ${pjson.version}`)
    console.log('#################################################################')
    console.log('## CONTRACTS')
    console.log('## --------------------------------------------------------------')
    const addresses = await truffleContractAddresses()
    for (const key in addresses) {
        console.log(`## ${key}: ${addresses[key]}`)
    }
    console.log('#################################################################')
    console.log('## ENV')
    console.log('## --------------------------------------------------------------')
    for (const key in process.env) {
        console.log(`## ${key}: ${process.env[key]}`)
    }
    console.log('#################################################################')
    console.log('\n')
}

module.exports = debugHeader
