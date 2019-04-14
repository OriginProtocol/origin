'use strict'
module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_attestation_method ADD VALUE 'GOOGLE';
    `)
  },
  down: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_attestation_method REMOVE VALUE 'GOOGLE';
    `)
  }
}
