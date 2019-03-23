import assert from 'assert'
import fs from 'fs'
import solc from 'solc'
import linker from 'solc/linker'
import Ganache from 'ganache-core'
import Web3 from 'web3'
import path from 'path'

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

const solidityCoverage = process.env['SOLIDITY_COVERAGE'] !== undefined
// Use solidity-coverage's forked testrpc if this is a coverage run
const defaultProvider = solidityCoverage
  ? 'ws://localhost:8555'
  : 'ws://localhost:7545'
export const contractPath = solidityCoverage
  ? `${__dirname}/../../coverageEnv/contracts`
  : `${__dirname}/../contracts`

// Instantiate a web3 instance. Start a node if one is not already running.
export async function web3Helper(provider = defaultProvider) {
  const web3 = new Web3(provider)
  const instance = await server(web3, provider)
  return { web3, server: instance }
}

function findImportsPath(prefix) {
  return function findImports(importPath) {
    try {
      if (importPath.indexOf('node_modules') < 0) {
        importPath = path.join(prefix, importPath)
      }
      const contents = fs.readFileSync(importPath).toString()
      return {
        contents
      }
    } catch (e) {
      console.log(`File not found: ${importPath}`)
      return { error: 'File not found' }
    }
  }
}

export default async function testHelper(contracts, provider) {
  const { web3, server } = await web3Helper(provider)
  const accounts = await web3.eth.getAccounts()

  async function deploy(
    contractName,
    { from, args, log, path, trackGas, file }
  ) {
    file = file || `${contractName}.sol`
    const sources = {
      [file]: {
        content: fs.readFileSync(`${path || contracts}/${file}`).toString()
      }
    }
    const compileOpts = JSON.stringify({ ...solcOpts, sources })

    // Compile the contract using solc
    const rawOutput = solc.compileStandardWrapper(
      compileOpts,
      findImportsPath(path) //contracts)
    )
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

    async function deployLib(linkedFile, linkedLib, bytecode) {
      const libObj = output.contracts[linkedFile][linkedLib]

      for (const linkedFile2 in libObj.evm.bytecode.linkReferences) {
        for (const linkedLib2 in libObj.evm.bytecode.linkReferences[
          linkedFile2
        ]) {
          libObj.evm.bytecode.object = await deployLib(
            linkedFile2,
            linkedLib2,
            libObj.evm.bytecode
          )
        }
      }

      const LibContract = new web3.eth.Contract(libObj.abi)
      const gas = solidityCoverage ? 3000000 * 5 : 3000000
      const libContract = await LibContract.deploy({
        data: libObj.evm.bytecode.object
      }).send({ from, gas })
      const libs = { [`${linkedFile}:${linkedLib}`]: libContract._address }
      return linker.linkBytecode(bytecode.object, libs)
    }

    // Deploy linked libraries
    for (const linkedFile in bytecode.linkReferences) {
      for (const linkedLib in bytecode.linkReferences[linkedFile]) {
        bytecode.object = await deployLib(linkedFile, linkedLib, bytecode)
      }
    }

    if (!bytecode.object) {
      throw new Error(
        'No Bytecode. Do the method signatures match the interface?'
      )
    }

    if (process.env.BUILD) {
      fs.writeFileSync(
        __dirname + '/../src/contracts/' + contractName + '.js',
        'module.exports = ' +
          JSON.stringify(
            {
              abi,
              data: bytecode.object
            },
            null,
            4
          )
      )
    }

    // Instantiate the web3 contract using the abi and bytecode output from solc
    const Contract = new web3.eth.Contract(abi)
    let contract

    await new Promise(async resolve => {
      const chainId = web3.eth.net.getId()

      const data = await Contract.deploy({
        data: '0x' + bytecode.object,
        arguments: args
      }).encodeABI()

      web3.eth
        .sendTransaction({
          data,
          from,
          value: 0,
          gas: solidityCoverage ? 6000000 * 5 : 6000000,
          chainId
        })
        .once('transactionHash', hash => {
          if (log) {
            console.log('Transaction Hash', hash)
          }
        })
        .once('receipt', receipt => {
          if (trackGas) {
            trackGas(`Deployed ${contractName}`)(receipt)
          }
          if (log) {
            console.log(
              `Deployed ${contractName} to ${receipt.contractAddress} (${
                receipt.cumulativeGasUsed
              } gas used)`
            )
          }
        })
        .catch('error', err => {
          console.log(err)
          resolve()
        })
        .then(instance => {
          contract = new web3.eth.Contract(abi, instance.contractAddress)
          resolve()
        })
    })

    if (contract) {
      // Set some default options on the contract
      contract.options.gas = solidityCoverage ? 1500000 * 5 : 1500000
      contract.options.from = from
    }

    return contract
  }

  function decodeEvent(rawEvent, Contract) {
    const { data, topics } = rawEvent
    const ruling = Contract._jsonInterface.find(i => {
      return i.signature === topics[0]
    })
    return web3.eth.abi.decodeLog(ruling.inputs, data, topics.slice(1))
  }

  async function blockTimestamp() {
    const block = await web3.eth.getBlock('latest')
    return block.timestamp
  }

  async function evmIncreaseTime(secs) {
    await web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [secs],
        id: new Date().getTime()
      },
      () => {}
    )

    // Mine a block to get the time change to occur
    await web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: new Date().getTime()
      },
      () => {}
    )
  }

  return {
    web3,
    accounts,
    deploy,
    server,
    decodeEvent,
    blockTimestamp,
    evmIncreaseTime
  }
}

// Start the server if it hasn't been already...
async function server(web3, provider) {
  try {
    // Hack to prevent "connection not open on send" error when using websockets
    web3.setProvider(provider.replace(/^ws/, 'http'))
    await web3.eth.net.getId()
    web3.setProvider(provider)
    return
  } catch (e) {
    /* Ignore */
  }

  let port = '7545'
  if (String(provider).match(/:([0-9]+)$/)) {
    port = provider.match(/:([0-9]+)$/)[1]
  }
  const server = Ganache.server()
  await server.listen(port)
  return server
}

// Asserts unless the given promise leads to an EVM revert.
// Ported from OpenZeppelin.
export async function assertRevert(promise, expectedErrorMsg = '') {
  try {
    await promise
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0 && error.message.search(expectedErrorMsg) >= 0
    assert(
      revertFound,
      `Expected "revert" ${expectedErrorMsg ? `with error message: ${expectedErrorMsg}`: ''}, got ${error} instead`
    )
    return
  }
  assert.fail('Expected revert not received')
}

/**
 * Asserts that the given promise throws an error with the given message.
 * @param {message} message - Message we expect to find in the exception.
 * @param {promise} promise - A promise that we expect to be rejected.
 */
export async function assertRevertWithMessage(message, promise) {
  try {
    await promise
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0
    assert(revertFound, `Expected "revert", got ${error} instead`)
    assert(error.message.match(message))
    return
  }
  assert.fail('Expected revert not received')
}
