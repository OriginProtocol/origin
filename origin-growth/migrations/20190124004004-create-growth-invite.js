'use strict'

const { GrowthInviteContactTypes, GrowthInviteStatuses } = require('../src/enums')

const tableName = 'growth_invite'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referrer_eth_address: {
        type: Sequelize.STRING
      },
      referee_contact_type: {
        type: Sequelize.ENUM(GrowthInviteContactTypes)
      },
      referee_contact: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM(GrowthInviteStatuses)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(tableName, ['referrer_eth_address', 'status']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
      .then(queryInterface.sequelize.query('DROP TYPE enum_growth_invite_referee_contact_type;'))
      .then(queryInterface.sequelize.query('DROP TYPE enum_growth_invite_status;'))
  }
}