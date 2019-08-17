module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('t3_user', 'name', {
        type: Sequelize.STRING
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('t3_user', 'name')
  }
}
