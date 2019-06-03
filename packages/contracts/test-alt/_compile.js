import fs from 'fs'
import solc from 'solc'
import memoize from 'lodash/memoize'
import requireFromString from 'require-from-string'

const solcOpts = {
  language: 'Solidity',
  settings: {
    metadata: { useLiteralContent: true },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    }
  }
}

function findImportsPath(prefix) {
  return function findImports(path) {
    try {
      if (path.indexOf('node_modules') < 0) {
        path = prefix + path
      }
      const contents = fs.readFileSync(path).toString()
      return {
        contents
      }
    } catch (e) {
      console.log(`File not found: ${path}`)
      return { error: 'File not found' }
    }
  }
}

/**
 * Multi Solc Version support. Can use local solc bin or load from remote
 * Local use requires a dir solc/ with different solc versions inside:
 * curl "https://ethereum.github.io/solc-bin/bin/soljson-v0.4.24+commit.e67f0147.js" --output soljson-v0.4.24.js
 */
const getSolcVersion = memoize(async version => {
  try {
    const solcPath = `${__dirname}/solc/soljson-v${version}.js`
    const solcSrc = fs.readFileSync(solcPath).toString()
    const solcImport = requireFromString(solcSrc)
    // console.log('Using local solc4')
    return solc.setupMethods(solcImport)
  } catch (e) {
    return await new Promise((resolve, reject) => {
      // console.log('Loading remote solc4')
      solc.loadRemoteVersion('v0.4.24+commit.e67f0147', function(err, solcv4) {
        if (err) return reject(err)
        resolve(solcv4)
      })
    })
  }
})

export default async function compile({ contractName, path, file, contracts }) {
  file = file || `${contractName}.sol`
  const content = fs.readFileSync(`${path || contracts}/${file}`).toString()
  const sources = { [file]: { content } }
  const compileOpts = JSON.stringify({ ...solcOpts, sources })
  const version = content.match(/pragma solidity \^?([^;]+);/)[1]
  const imports = findImportsPath(path)
  let rawOutput

  if (version.indexOf('0.5.') === 0) {
    // Compile the contract using solc
    rawOutput = solc.compileStandardWrapper(compileOpts, imports)
  } else {
    const solcSnapshot = await getSolcVersion(version)
    rawOutput = solcSnapshot.compileStandardWrapper(compileOpts, imports)
  }

  const output = JSON.parse(rawOutput)

  // If there were any compilation errors, throw them
  if (output.errors) {
    output.errors.forEach(err => {
      if (!err.formattedMessage.match(/Warning:/)) {
        throw new SyntaxError(err.formattedMessage)
      }
    })
  }

  const {
    abi,
    evm: { bytecode }
  } = output.contracts[file][contractName]

  return { abi, bytecode, output }
}
