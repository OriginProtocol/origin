import contracts from '../../contracts'

async function login(_, { wallet }) {
  contracts.authClient.setWeb3(contracts.web3Exec)

  return {
    success: await contracts.authClient.login(wallet)
  }
}

export default login
