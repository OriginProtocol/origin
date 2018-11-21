'use strict';

// TODO: create seeder that reads in a CSV file
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Grants', [
      {
        email: 'cuong@originprotocol.com',
        grantedAt: '2010-01-31 00:00:00',
        amount: 120000,
        totalMonths: 48,
        cliffMonths: 12,
        vested: 120000,
        transferred: 100000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'cuong@originprotocol.com',
        grantedAt: '2017-01-31 00:00:00',
        amount: 480,
        totalMonths: 48,
        cliffMonths: 12,
        vested: 0,
        transferred: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'cuong@originprotocol.com',
        grantedAt: '2017-08-01 00:00:00',
        amount: 112,
        totalMonths: 48,
        cliffMonths: 12,
        vested: 0,
        transferred: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'cuong@originprotocol.com',
        grantedAt: '2018-08-01 00:00:00',
        amount: 120,
        totalMonths: 48,
        cliffMonths: 12,
        vested: 0,
        transferred: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Grants', null, {})
  }
}
