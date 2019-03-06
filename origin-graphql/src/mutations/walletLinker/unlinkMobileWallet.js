import contracts from '../../contracts'

async function unlinkMobileWallet() {
  if (!contracts.linker) return false

  try {
    await contracts.linker.unlink()
  } catch (e) {
    console.log('unlink error:', e)
    return false
  }
  return true
}

export default unlinkMobileWallet
