module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('t3_user', 'otp_verified', {
      type: Sequelize.BOOLEAN
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('t3_user', 'otp_verified')
  }
}
