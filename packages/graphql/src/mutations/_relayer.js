import contracts from '../contracts'

export default async function relayerHelper({ tx, from, address }) {
  const txData = tx.encodeABI()
  const dataToSign = contracts.web3.utils.soliditySha3(
    { t: 'address', v: from }, // Signer
    { t: 'address', v: address }, // Marketplace address
    { t: 'uint256', v: contracts.web3.utils.toWei('0', 'ether') }, // value
    { t: 'bytes', v: txData },
    // Should get nonce from DB
    { t: 'uint256', v: 0 } // nonce
  )
  // console.log(dataToSign)

  const signature = await contracts.web3Exec.eth.personal.sign(dataToSign, from)

  // const signedAlt = await new Promise(resolve =>
  //   setTimeout(() => {
  //   //   buff = Buffer.from(dataToSign.substr(2), 'hex')
  //   // return buff.length === 32 ? hex : buff.toString('utf8')
  //     context.web3Exec.currentProvider.sendAsync(
  //       {
  //         method: 'eth_signTypedData',
  //         params: [
  //           [
  //             {
  //               type: 'string',
  //               name: 'Create Listing Hash',
  //               value: dataToSign.substr(2)
  //             }
  //           ],
  //           from
  //         ],
  //         from
  //       },
  //       (err, res) => resolve(res.result)
  //     )
  //   }, 500)
  // )
  //
  // console.log(signed)
  // console.log(signedAlt)

  const response = await fetch('http://localhost:5100', {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({
      to: address,
      from,
      signature,
      txData,
      provider: contracts.web3.currentProvider.host
    })
  })

  if (contracts.automine) {
    setTimeout(() => {
      contracts.web3.currentProvider.send({ method: 'evm_mine' }, () => {})
    }, contracts.automine)
  }

  const data = await response.json()
  return { id: data.id }
}
