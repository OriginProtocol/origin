const Sequelize = require('sequelize')
const config = require('../config')()

const SqliteURI = `sqlite:${__dirname}/${config.network}.db`
const URI = process.env.DATABASE_URL || SqliteURI
const sequelize = new Sequelize(URI)

const Network = sequelize.define(
  'network',
  {
    // attributes
    network_id: {
      type: Sequelize.INTEGER,
      unique: true
    },
    last_block: {
      type: Sequelize.INTEGER
    }
  },
  {
    // options
  }
)

const Transactions = sequelize.define(
  'transactions',
  {
    // attributes
    network_id: {
      type: Sequelize.INTEGER,
      unique: 'compositeIndex'
    },
    transaction_hash: {
      type: Sequelize.STRING,
      unique: 'compositeIndex'
    },
    block_number: {
      type: Sequelize.INTEGER
    }
  },
  {
    // options
  }
)

const Orders = sequelize.define(
  'orders',
  {
    order_id: {
      type: Sequelize.STRING,
      unique: true
    },
    // attributes
    network_id: {
      type: Sequelize.INTEGER
    },
    created_at: {
      type: Sequelize.INTEGER
    },
    data: {
      type: Sequelize.TEXT
    }
  },
  {
    // options
  }
)

sequelize.sync()

module.exports = {
  Network,
  Transactions,
  Orders
}
