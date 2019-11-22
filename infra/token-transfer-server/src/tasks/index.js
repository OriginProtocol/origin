const cron = require('node-cron')

const { executeTransfers } = require('./transfer')

cron.schedule('*/1 * * * * *', executeTransfers)
