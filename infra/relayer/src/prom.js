const promBundle = require('express-prom-bundle')

const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})

const txCounter = new bundle.promClient.Counter({
  name: 'relayer_transactions_sent',
  help: 'Number of transactions sent by the relayer'
})

const errorCounter = new bundle.promClient.Counter({
  name: 'relayer_handler_error',
  help: 'Number of errors from the relayer'
})

const pendingTxGauge = new bundle.promClient.Gauge({
  name: 'relayer_purse_pending_tx',
  help: 'Number of pending transactions in the relayer purse'
})

const rebroadcastCounter = new bundle.promClient.Counter({
  name: 'relayer_purse_rebroadcast',
  help:
    'Number of transactions that were reboradcast to the network by relayer purse'
})

const gasPriceGauge = new bundle.promClient.Gauge({
  name: 'relayer_purse_gas_price',
  help: 'Current gas price used by relayer purse'
})

const masterBalanceGauge = new bundle.promClient.Gauge({
  name: 'relayer_purse_master_balance',
  help: 'Current balance of the relayer purse master account'
})

const txConfirmHisto = new bundle.promClient.Histogram({
  name: 'relayer_purse_time_to_confirm',
  help: 'The duration it takes for relayer purse transactions to be mined'
})

module.exports = {
  bundle,
  metrics: {
    txCounter,
    errorCounter,
    pendingTxGauge,
    rebroadcastCounter,
    gasPriceGauge,
    masterBalanceGauge,
    txConfirmHisto
  }
}
