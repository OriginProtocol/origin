import contracts from '../contracts'

export default {
  tokenStatus: (_, { wallet }) => {
    if (process.env.NODE_ENV === 'test') {
      return {
        valid: true,
        expired: false,
        willExpire: false
      }
    }

    return contracts.authClient.getWalletTokenStatus(wallet)
  },
  isLoggedIn: (_, { wallet }) => {
    if (process.env.NODE_ENV === 'test') {
      return true
    }

    return contracts.authClient.isLoggedIn(wallet)
  }
}
