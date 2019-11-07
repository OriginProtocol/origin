import contracts from '../contracts'

export default {
  tokenStatus: (_, { wallet }) => contracts.authClient.getWalletTokenStatus(wallet),
  isLoggedIn: (_, { wallet }) => contracts.authClient.isLoggedIn(wallet)
}
