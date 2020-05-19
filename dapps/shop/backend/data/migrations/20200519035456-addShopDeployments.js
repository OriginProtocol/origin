module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() => {
      queryInterface.createTable('shop_deployments', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        shop_id: {
          type: Sequelize.INTEGER,
          references: { model: 'shops', key: 'id' }
        },
        domain: Sequelize.STRING,
        ipfs_gateway: Sequelize.STRING,
        ipfs_hash: Sequelize.STRING,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE
      })
    })
  },
  down: queryInterface => {
    return queryInterface.sequelize.transaction(() => {
      queryInterface.dropTable('shop_deployments')
    })
  }
}
