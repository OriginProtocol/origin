/**
 * It's currently not possible to configure the contract JSON outputted by
 * Truffle. This script re-writes the contract JSON, pulling out only the
 * pieces needed by origin-js and significantly reducing the overall bundle
 * size
 */

const fs = require('fs')
const contractDir = __dirname + '/../build/contracts'
const files = fs.readdirSync(contractDir)

files.forEach(file => {
  const filePath = `${contractDir}/${file}`
  const contractJSON = fs.readFileSync(filePath).toString()
  const { abi, bytecode, contractName, networks } = JSON.parse(
    contractJSON
  )
  const simplifiedJSON = { abi, bytecode, contractName, networks }
  fs.writeFileSync(filePath, JSON.stringify(simplifiedJSON, null, 4))
})
