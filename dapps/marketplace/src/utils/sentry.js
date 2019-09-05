import * as Sentry from '@sentry/browser'

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: `marketplace-dapp@${process.env.GIT_COMMIT_HASH}`,
    environment: process.env.NAMESPACE
  })
}

export default Sentry
