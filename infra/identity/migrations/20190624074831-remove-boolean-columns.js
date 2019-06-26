'use strict'

module.exports = {
  up: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('identity', 'github_verified'),
      queryInterface.removeColumn('identity', 'kakao_verified'),
      queryInterface.removeColumn('identity', 'linkedin_verified'),
      queryInterface.removeColumn('identity', 'wechat_verified')
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('identity', 'github_verified', Sequelize.BOOLEAN),
      queryInterface.addColumn('identity', 'kakao_verified', Sequelize.BOOLEAN),
      queryInterface.addColumn('identity', 'linkedin_verified', Sequelize.BOOLEAN),
      queryInterface.addColumn('identity', 'wechat_verified', Sequelize.BOOLEAN)
    ])
  }
}
