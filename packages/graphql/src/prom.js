import promBundle from 'express-prom-bundle'

export const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})

// TODO: Add custom metrics (e.g. graphql operations)
/*const txCounter = new bundle.promClient.Counter({
  name: 'relayer_transactions_sent',
  help: 'Number of transactions sent by the relayer'
})*/

export const metrics = {}
