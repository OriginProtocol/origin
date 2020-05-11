module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.createTable('external_payments', {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE,
          external_id: Sequelize.STRING,
          order_id: Sequelize.STRING,
          data: Sequelize.TEXT,
          payment_at: Sequelize.DATE,
          amount: Sequelize.INTEGER,
          fee: Sequelize.INTEGER,
          net: Sequelize.INTEGER
        }),
        queryInterface.createTable('external_orders', {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE,
          ordered_at: Sequelize.DATE,
          external_id: Sequelize.STRING,
          order_id: Sequelize.STRING,
          data: Sequelize.TEXT,
          amount: Sequelize.INTEGER
        })
      ])
    })
  },
  down: queryInterface => {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.dropTable('external_payments'),
        queryInterface.dropTable('external_orders')
      ])
    })
  }
}
