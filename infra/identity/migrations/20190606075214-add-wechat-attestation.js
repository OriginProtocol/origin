'use strict'

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_attestation_method ADD VALUE 'WECHAT';
    `)
  },
  down: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_attestation_method REMOVE VALUE 'WECHAT';
    `)
  }
}
