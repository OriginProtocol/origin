'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('attestation', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ethAddress: {
        type: Sequelize.CHAR(42)
      },
      method: {
        type: Sequelize.ENUM('PHONE', 'EMAIL', 'AIRBNB', 'FACEBOOK', 'TWITTER')
      },
      value: {
        type: Sequelize.STRING
      },
      signature: {
        type: Sequelize.STRING
      },
      remoteIpAddress: {
        type: Sequelize.INET
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('attestation')
  }
}
