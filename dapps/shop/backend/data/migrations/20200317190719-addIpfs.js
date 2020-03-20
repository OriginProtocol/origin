'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.addColumn('networks', 'ipfs', {
          type: Sequelize.STRING
        }),
        queryInterface.addColumn('networks', 'ipfs_api', {
          type: Sequelize.STRING
        }),
        queryInterface.addColumn('networks', 'marketplace_contract', {
          type: Sequelize.STRING
        }),
        queryInterface.addColumn('networks', 'marketplace_version', {
          type: Sequelize.STRING
        }),
        queryInterface.bulkInsert('networks', [
          {
            network_id: '999',
            provider: 'http://localhost:8545',
            provider_ws: 'ws://localhost:8545',
            marketplace_version: '001',
            ipfs: 'http://localhost:8080',
            ipfs_api: 'http://localhost:5002'
          }
        ])
      ])
    )
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.removeColumn('networks', 'ipfs'),
        queryInterface.removeColumn('networks', 'ipfs_api'),
        queryInterface.removeColumn('networks', 'marketplace_contract'),
        queryInterface.removeColumn('networks', 'marketplace_version')
      ])
    )
  }
}
