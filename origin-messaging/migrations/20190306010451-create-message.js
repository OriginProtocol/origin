'use strict'
const tableName = 'message'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      conversation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'conversation', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        primaryKey: true
      },
      conversation_index: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      eth_address: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      data: {
        type: Sequelize.JSON
      },
      signature: {
        type: Sequelize.STRING(256)
      },
      is_keys: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}
