import * as Sentry from '@sentry/browser'

const NET_TO_ENV = {
  '1': 'prod',
  '4': 'staging'
}

function getEnvName() {
  if (process.env.NAMESPACE && process.env.NAMESPACE !== 'dev') {
    return process.env.NAMESPACE
  }
  if (!process.env.ETH_NETWORK_ID || !NET_TO_ENV[process.env.ETH_NETWORK_ID]) {
    return 'dev'
  }
  return NET_TO_ENV[process.env.ETH_NETWORK_ID]
}

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: `marketplace-dapp@${process.env.GIT_COMMIT_HASH}`,
    environment: getEnvName()
  })
  Sentry.configureScope(scope => {
    scope.setTag(
      'isWebView',
      typeof window !== 'undefined' &&
        typeof window.ReactNativeWebView !== 'undefined'
    )
    scope.setTag(
      'isOrigin',
      typeof window !== 'undefined' &&
        typeof window.web3 !== 'undefined' &&
        typeof window.web3.providers !== 'undefined' &&
        window.web3.providers.length > 0 &&
        window.web3.providers[0].isOrigin
    )
  })
}

export default Sentry
