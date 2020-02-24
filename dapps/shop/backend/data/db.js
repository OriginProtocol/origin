const Sequelize = require('sequelize')
const { NETWORK } = require('../utils/const')

const SqliteURI = `sqlite:${__dirname}/net_${NETWORK}.db`
const URI = process.env.DATABASE_URL || SqliteURI
const sequelize = new Sequelize(URI, { logging: false, underscored: true })

console.debug(`Connecting to database @ ${URI}`)

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
    networkId: {
      type: Sequelize.INTEGER
    },
    // e.g. 1-001-1212
    listingId: {
      type: Sequelize.STRING
    },
    sellerId: {
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    authToken: {
      type: Sequelize.STRING
    },
    config: {
      type: Sequelize.TEXT
    },
    firstBlock: {
      type: Sequelize.INTEGER
    },
    lastBlock: {
      type: Sequelize.INTEGER
    }
  },
  {
    ...baseModelOptions
  }
)

const Network = sequelize.define(
  'networks',
  {
    // attributes
    networkId: {
      type: Sequelize.INTEGER,
      unique: true
    },
    lastBlock: {
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
    networkId: {
      type: Sequelize.INTEGER,
      unique: 'compositeIndex'
    },
    shopId: {
      type: Sequelize.INTEGER
    },
    transactionHash: {
      type: Sequelize.STRING,
      unique: 'compositeIndex'
    },
    blockNumber: {
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
    networkId: {
      type: Sequelize.INTEGER
    },
    orderId: {
      type: Sequelize.STRING,
      unique: true
    },
    ipfsHash: {
      type: Sequelize.STRING
    },
    encryptedIpfsHash: {
      type: Sequelize.STRING
    },
    createdBlock: {
      type: Sequelize.INTEGER,
    },
    updatedBlock: {
      type: Sequelize.INTEGER,
    },
    shopId: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.INTEGER
    },
    currency: {
      type: Sequelize.STRING
    },
    value: {
      type: Sequelize.STRING
    },
    commission: {
      type: Sequelize.STRING
    },
    buyer: {
      type: Sequelize.STRING
    },
    affiliate: {
      type: Sequelize.STRING
    },
    arbitrator: {
      type: Sequelize.STRING
    },
    finalizes: {
      type: Sequelize.STRING
    },
    notes: {
      type: Sequelize.TEXT
    },
    data: {
      type: Sequelize.TEXT
    }
  },
  {
    ...baseModelOptions,
    timestamps: false
  }
)

const Events = sequelize.define(
  'events',
  {
    // attributes
    networkId: {
      type: Sequelize.INTEGER
    },
    shopId: {
      type: Sequelize.INTEGER
    },
    transactionHash: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    blockHash: {
      type: Sequelize.STRING
    },
    blockNumber: {
      type: Sequelize.INTEGER
    },
    timestamp: {
      type: Sequelize.INTEGER
    },
    data: {
      type: Sequelize.STRING
    },
    topic1: {
      type: Sequelize.STRING
    },
    topic2: {
      type: Sequelize.STRING
    },
    topic3: {
      type: Sequelize.STRING
    },
    topic4: {
      type: Sequelize.STRING
    },
    eventName: {
      type: Sequelize.STRING
    },
    party: {
      type: Sequelize.STRING
    },
    listingId: {
      type: Sequelize.INTEGER
    },
    offerId: {
      type: Sequelize.INTEGER
    },
    ipfsHash: {
      type: Sequelize.STRING
    }
  },
  {
    ...baseModelOptions,
    timestamps: false
  }
)

const Discounts = sequelize.define(
  'discounts',
  {
    networkId: {
      type: Sequelize.INTEGER
    },
    shopId: {
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
Shops.belongsTo(Sellers, { as: 'sellers', foreignKey: 'sellerId' })
Sellers.hasMany(Shops, { as: 'shops' })

// Shop -> Orders
Orders.belongsTo(Shops, { as: 'shops', foreignKey: 'shopId' })
Shops.hasMany(Orders, { as: 'orders', targetKey: 'shopId' })

// Shop -> Transactions
Transactions.belongsTo(Shops, { as: 'shops', foreignKey: 'shopId' })
Shops.hasMany(Transactions, { as: 'transactions' })

// Shop -> Discounts
Discounts.belongsTo(Shops, { as: 'shops', foreignKey: 'shopId' })
Shops.hasMany(Discounts, { as: 'discounts' })

try {
  // This is a race basically.  We'll disable it and run in explicitly in Docker
  if (typeof process.env.DISABLE_SYNC !== 'undefined') sequelize.sync()
} catch (err) {
  console.error('Error occurred while doing a Sequelize sync')
  console.error(err)
  process.exit(1)
}

module.exports = {
  Op: Sequelize.Op,
  Sequelize,
  sequelize,
  Sellers,
  Shops,
  Network,
  Transactions,
  Orders,
  Discounts,
  Events
}
