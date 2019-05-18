import fs from 'fs'
import compile from '../test-alt/_compile'

const contracts = [
  {
    path: `${__dirname}/../contracts/proxy`,
    file: 'ProxyFactory.s',
    contractName: 'ProxyFactory'
  },
  {
    path: `${__dirname}/../contracts/identity`,
    file: 'IdentityProxy.s',
    contractName: 'IdentityProxy'
  }
]

async function start() {
  for (const contract of contracts) {
    const { path, file, contractName } = contract
    const { abi, bytecode } = await compile({ contractName, path, file })

    const output = `${__dirname}/../build/contracts/${contractName}_solc.json`
    const json = { abi, bytecode: '0x' + bytecode.object }
    fs.writeFileSync(output, JSON.stringify(json, null, 2))
    console.log(`Compiled ${file} OK.`)
  }
}

start()
