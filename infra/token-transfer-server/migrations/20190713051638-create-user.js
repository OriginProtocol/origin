'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('t3_user', {
      email: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      // Key used for OTP authentication.
      otp_key: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('t3_user')
  }
}