import contracts from '../../contracts'

async function logout(_, { wallet }) {
  return {
    success: await contracts.authClient.logout(wallet)
  }
}

export default logout
