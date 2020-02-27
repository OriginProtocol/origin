module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.createTable(
          'sellers',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.STRING
          }
        ),
        queryInterface.createTable(
          'shops',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            network_id: Sequelize.INTEGER,
            // e.g. 1-001-1212
            listing_id: Sequelize.STRING,
            seller_id: Sequelize.INTEGER,
            hostname: Sequelize.STRING,
            name: Sequelize.STRING,
            auth_token: Sequelize.STRING,
            config: Sequelize.TEXT,
            first_block: Sequelize.INTEGER,
            last_block: Sequelize.INTEGER
          }
        ),
        queryInterface.createTable(
          'networks',
          {
            network_id: {
              type: Sequelize.INTEGER,
              unique: true
            },
            last_block: Sequelize.INTEGER,
            provider: Sequelize.STRING,
            provider_ws: Sequelize.STRING
          }
        ),
        queryInterface.createTable(
          'transactions',
          {
            network_id: {
              type: Sequelize.INTEGER,
              unique: 'compositeIndex'
            },
            shop_id: Sequelize.INTEGER,
            transaction_hash: {
              type: Sequelize.STRING,
              unique: 'compositeIndex'
            },
            block_number: Sequelize.INTEGER
          }
        ),
        queryInterface.createTable(
          'orders',
          {
            network_id: Sequelize.INTEGER,
            order_id: {
              type: Sequelize.STRING,
              unique: true,
              primaryKey: true
            },
            ipfs_hash: Sequelize.STRING,
            encrypted_ipfs_hash: Sequelize.STRING,
            created_block: Sequelize.INTEGER,
            updated_block: Sequelize.INTEGER,
            shop_id: Sequelize.INTEGER,
            status: Sequelize.INTEGER,
            currency: Sequelize.STRING,
            value: Sequelize.STRING,
            commission: Sequelize.STRING,
            buyer: Sequelize.STRING,
            affiliate: Sequelize.STRING,
            arbitrator: Sequelize.STRING,
            finalizes: Sequelize.STRING,
            notes: Sequelize.TEXT,
            data: Sequelize.TEXT
          }
        ),
        queryInterface.createTable(
          'events',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
            },
            network_id: Sequelize.INTEGER,
            shop_id: Sequelize.INTEGER,
            transaction_hash: Sequelize.STRING,
            address: Sequelize.STRING,
            block_hash: Sequelize.STRING,
            block_number: Sequelize.INTEGER,
            timestamp: Sequelize.INTEGER,
            data: Sequelize.STRING,
            topic1: Sequelize.STRING,
            topic2: Sequelize.STRING,
            topic3: Sequelize.STRING,
            topic4: Sequelize.STRING,
            event_name: Sequelize.STRING,
            party: Sequelize.STRING,
            listing_id: Sequelize.INTEGER,
            offer_id: Sequelize.INTEGER,
            ipfs_hash: Sequelize.STRING
          }
        ),
        queryInterface.createTable(
          'discounts',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
            network_id: Sequelize.INTEGER,
            shop_id: Sequelize.INTEGER,
            status: {
              type: Sequelize.ENUM('active', 'inactive')
            },
            code: Sequelize.STRING,
            discount_type: {
              type: Sequelize.ENUM('fixed', 'percentage')
            },
            value: Sequelize.INTEGER,
            max_uses: Sequelize.INTEGER,
            one_per_customer: Sequelize.BOOLEAN,
            start_time: Sequelize.DATE,
            end_time: Sequelize.DATE,
            uses: Sequelize.INTEGER
          }
        )
      ])
    })
  },
  down: queryInterface => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.dropTable('discounts'),
        queryInterface.dropTable('events'),
        queryInterface.dropTable('networks'),
        queryInterface.dropTable('orders'),
        queryInterface.dropTable('sellers'),
        queryInterface.dropTable('shops'),
        queryInterface.dropTable('transactions')
      ])
    })
  }
}
