const esmImport = require('esm')(module)
const context = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')
const ipfs = esmImport('@origin/ipfs')
const Web3 = require('web3')
const eth = require('web3-eth')
const stringify = require('json-stable-stringify')
const db = {
  ...require('@origin/identity/src/models'),
  ...require('../../models')
}

/**
 * This private key needs to match the `context.config.attestationIssuer`
 * configured account for the network you're using.  For example:
 * https://github.com/OriginProtocol/origin/blob/master/packages/graphql/src/configs/localhost.js#L19
 */
const PRIVKEY = process.env.PRIVKEY
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'http://localhost:5002'
const TEST_IP = '52.64.128.254'
const TEST_PHONE = '1 123-345-7890' // This appears to be the storage format

// Shamelessly stolen from infra/bridge/src/utils/attestation.js
function generateAttestationSignature(privateKey, subject, data) {
  if (!Web3.utils.isHexStrict(privateKey)) {
    throw new Error('Invalid private key, not a hex string')
  }
  const hashToSign = Web3.utils.soliditySha3(
    {
      t: 'address',
      v: Web3.utils.toChecksumAddress(subject)
    },
    {
      t: 'bytes32',
      v: Web3.utils.sha3(data)
    }
  )
  const signedMessage = new eth().accounts.sign(hashToSign, privateKey)
  return signedMessage.signature
}

function generateAttestationJSON(
  addr,
  attestationSignerAddress,
  signature,
  attestationJson
) {
  return JSON.parse(`{
    "schemaId": "https://schema.originprotocol.com/identity_1.0.0.json",
    "profile": {
        "firstName": "John",
        "lastName": "Testman",
        "description": "",
        "avatar": "",
        "schemaId": "https://schema.originprotocol.com/profile_2.0.0.json",
        "ethAddress": "${addr}"
    },
    "attestations": [{
        "schemaId": "https://schema.originprotocol.com/attestation_1.0.0.json",
        "data": ${attestationJson},
        "signature": {
            "bytes": "${signature}",
            "version": "1.0.0"
        }
    }]
  }`)
}

async function addAttestationToIPFS(jason) {
  return await ipfs.post(IPFS_GATEWAY, jason)
}

async function addAttestationToDB(addr, signature) {
  return await db.Attestation.create({
    method: 'PHONE',
    ethAddress: addr,
    value: TEST_PHONE,
    signature: signature,
    remoteIpAddress: TEST_IP
  })
}

async function main() {
  const web3 = context.web3
  const netId = await web3.eth.net.getId()

  if (netId < 100) {
    console.log(
      '!!!!!!!!!!!! DO NOT RUN THIS ON A PRODUCTION NETWORK !!!!!!!!!!!!'
    )
    process.exit(1)
  }

  const identityEvents = context.identityEvents
  const accounts = await web3.eth.getAccounts()
  const sender = process.env.ACCOUNT || accounts[0]

  const attestationJson = stringify({
    issuer: {
      name: 'Origin Protocol',
      url: 'https://www.originprotocol.com',
      ethAddress: context.config.attestationIssuer
    },
    issueDate: new Date(),
    attestation: {
      verificationMethod: {
        ['phone']: true
      },
      phone: {
        verified: true
      }
    }
  })

  const signature = generateAttestationSignature(
    PRIVKEY,
    sender,
    attestationJson
  )

  const jason = generateAttestationJSON(
    sender.toLowerCase(),
    context.config.attestationIssuer,
    signature,
    attestationJson
  )

  const ipfsHash = await addAttestationToIPFS(jason)
  await addAttestationToDB(sender.toLowerCase(), signature)
  const txHash = await identityEvents.methods
    .emitIdentityUpdated(ipfsHash)
    .send({
      from: sender,
      gas: 1e6,
      gasPrice: 1e9
    })

  console.log('txHash: ', txHash.transactionHash)
}

// eslint-disable-next-line no-extra-semi
;(async function() {
  if (!PRIVKEY) {
    console.log('Env var PRIVKEY must be set!')
    process.exit(1)
  }

  setNetwork(process.env.NETWORK || 'localhost')
  console.log('network: ', context.net)

  await main().then(() => {
    process.exit()
  })
})()
