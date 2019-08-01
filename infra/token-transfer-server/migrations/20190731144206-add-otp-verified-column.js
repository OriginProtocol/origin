module.exports = {
  up: (queryInterface) => {
    return queryInterface.addColumn('t3_user', 'otp_verified', {
      type: Sequelize.BOOLEAN
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('t3_user', 'otp_verified')
  }
}
