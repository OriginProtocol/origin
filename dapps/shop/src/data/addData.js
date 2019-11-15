import { post } from '@origin/ipfs'

const pubKey = process.env.PGP_PUBLIC_KEY

async function addData(data) {
  const gateway = context.config.ipfsRPC
  const pubKeyObj = await openpgp.key.readArmored(pubKey)

  const randomArray = Array.from(crypto.getRandomValues(new Uint32Array(5)))
  data.dataKey = randomArray.map(n => n.toString(36)).join('')

  const buyerData = await openpgp.encrypt({
    message: openpgp.message.fromText(JSON.stringify(data)),
    passwords: [data.dataKey]
  })

  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromText(JSON.stringify(data)),
    publicKeys: pubKeyObj.keys
  })

  const res = await post(
    gateway,
    { data: encrypted.data, buyerData: buyerData.data },
    true
  )
  return { hash: res, auth: data.dataKey }
}

export default addData
