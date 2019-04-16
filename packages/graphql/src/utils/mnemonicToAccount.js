import bip39 from 'bip39'
import HDKey from 'hdkey'

const Names = ['Admin', 'Stan', 'Nick', 'Origin', 'Origin']
const Roles = ['Admin', 'Seller', 'Buyer', 'Arbitrator', 'Affiliate']

export const defaultMnemonic =
  'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

export default function mnemonicToAccounts(
  mnemonic = defaultMnemonic,
  num = Names.length
) {
  const keys = []
  const seed = bip39.mnemonicToSeed(mnemonic)
  const masterSeed = HDKey.fromMasterSeed(seed)

  for (let offset = 0; offset < num; offset++) {
    const acct = masterSeed.derive(`m/44'/60'/0'/0/${offset}`)
    keys.push({
      name: Names[offset],
      role: Roles[offset],
      privateKey: `0x${acct.privateKey.toString('hex')}`
    })
  }
  return keys
}
