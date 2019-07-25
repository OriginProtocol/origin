const utils = require('ethereumjs-util')
const Web3 = require('web3')

const normalizeAddress = addr => {
  return addr.toLowerCase()
}

const verifySig = async ({ web3, to, from, signature, txData, nonce = 0 }) => {
  const signedData = web3.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: web3.utils.toWei('0', 'ether') },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )

  try {
    const msgBuffer = utils.toBuffer(signedData)

    const prefix = Buffer.from('\x19Ethereum Signed Message:\n')
    const prefixedMsg = utils.keccak256(
      Buffer.concat([prefix, Buffer.from(String(msgBuffer.length)), msgBuffer])
    )

    const r = utils.toBuffer(signature.slice(0, 66))
    const s = utils.toBuffer('0x' + signature.slice(66, 130))
    let v = utils.bufferToInt(utils.toBuffer('0x' + signature.slice(130, 132)))
    // In case whatever signs doesn't add the magic number, nor use EIP-155
    if ([0, 1].indexOf(v) > -1) v += 27

    const pub = utils.ecrecover(prefixedMsg, v, r, s)
    const address = '0x' + utils.pubToAddress(pub).toString('hex')
    const verified = normalizeAddress(address) === normalizeAddress(from)
    console.log('address:', address)
    console.log('from: ', from)
    console.log(
      `(${normalizeAddress(address)} === ${normalizeAddress(
        from
      )}) === ${verified}`
    )
    return verified
  } catch (e) {
    console.error('error recovering', e)
    return false
  }
}

if (require.main === module && process.stdin.isTTY) {
  const [to, from, signature, txData, nonce] = process.argv.slice(2)
  console.log('to: ', to)
  console.log('from: ', from)
  console.log('signature: ', signature)
  console.log('txData: ', txData)
  console.log('nonce: ', nonce || 0)
  verifySig({ web3: Web3, to, from, signature, txData, nonce }).then(
    verified => {
      console.log('verified: ', verified)
      if (verified) {
        console.log('Signature verified!')
      } else {
        console.error('Invalid signature!')
        process.exit(1)
      }
    }
  )
}
