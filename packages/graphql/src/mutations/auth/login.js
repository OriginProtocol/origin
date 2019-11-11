import contracts from '../../contracts'

async function login(_, { wallet }) {
  contracts.authClient.setWeb3(contracts.web3Exec)

  try {
    await contracts.authClient.login(wallet)
    return {
      success: true
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      reason: err.message
    }
  }
}

export default login
