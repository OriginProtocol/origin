import contracts from '../../contracts'

async function linkMobileWallet() {
  if (!contracts.linker) return false

  try {
    const code = await contracts.linker.link()
    return { code }
  } catch (e) {
    console.log('link error:', e)
    return null
  }
}

export default linkMobileWallet
