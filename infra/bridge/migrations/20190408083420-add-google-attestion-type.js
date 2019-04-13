'use strict'
module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE attestationtypes ADD VALUE 'GOOGLE';
    `)
  },
  down: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE attestationtypes REMOVE VALUE 'GOOGLE';
    `)
  }
}
