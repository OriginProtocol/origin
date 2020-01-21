const Sequelize = require('sequelize')
const config = require('../config')

const SqliteURI = `sqlite:${__dirname}/net_${config.network}.db`
const URI = process.env.DATABASE_URL || SqliteURI
const sequelize = new Sequelize(URI, { logging: false, underscored: true })

const baseModelOptions = {
  underscored: true
}

const Sellers = sequelize.define(
  'sellers',
  {
    // attributes
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    }
  },
  {
    ...baseModelOptions
  }
)

const Shops = sequelize.define(
  'shops',
  {
    // attributes
    name: {
      type: Sequelize.STRING
    },
    seller_id: {
      type: Sequelize.INTEGER
    },
    // e.g. 1-001-1212
    listing_id: {
      type: Sequelize.STRING
    },
    auth_token: {
      type: Sequelize.STRING
    },
    config: {
      type: Sequelize.TEXT
    }
  },
  {
    ...baseModelOptions
  }
)

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
    ...baseModelOptions
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
    shop_id: {
      type: Sequelize.INTEGER
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
    ...baseModelOptions
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
    shop_id: {
      type: Sequelize.INTEGER
    },
    data: {
      type: Sequelize.TEXT
    }
  },
  {
    ...baseModelOptions
  }
)

const Discounts = sequelize.define(
  'discounts',
  {
    network_id: {
      type: Sequelize.INTEGER
    },
    shop_id: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive')
    },
    code: {
      type: Sequelize.STRING
    },
    discountType: {
      type: Sequelize.ENUM('fixed', 'percentage')
    },
    value: {
      type: Sequelize.INTEGER
    },
    maxUses: {
      type: Sequelize.INTEGER
    },
    onePerCustomer: {
      type: Sequelize.BOOLEAN
    },
    startTime: {
      type: Sequelize.DATE
    },
    endTime: {
      type: Sequelize.DATE
    },
    uses: {
      type: Sequelize.INTEGER
    }
  },
  {
    ...baseModelOptions
  }
)

// Seller -> Shop
Shops.belongsTo(Sellers, { as: 'sellers', foreignKey: 'seller_id' })
Sellers.hasMany(Shops, { as: 'shops' })

// Shop -> Orders
Orders.belongsTo(Shops, { as: 'shops', foreignKey: 'shop_id' })
Shops.hasMany(Orders, { as: 'orders', targetKey: 'shop_id' })

// Shop -> Transactions
Transactions.belongsTo(Shops, { as: 'shops', foreignKey: 'shop_id' })
Shops.hasMany(Transactions, { as: 'transactions' })

// Shop -> Discounts
Discounts.belongsTo(Shops, { as: 'shops', foreignKey: 'shop_id' })
Shops.hasMany(Discounts, { as: 'discounts' })

sequelize.sync()

module.exports = {
  Sellers,
  Shops,
  Network,
  Transactions,
  Orders,
  Discounts,
  Sequelize
}
