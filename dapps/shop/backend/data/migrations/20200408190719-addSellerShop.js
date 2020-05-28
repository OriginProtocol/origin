'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([
        queryInterface.createTable('seller_shop', {
          seller_id: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          shop_id: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          role: Sequelize.STRING,
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE
        }),
        new Promise(resolve => {
          queryInterface.sequelize
            .query('SELECT id AS shop_id, seller_id FROM shops')
            .then(([rows]) => {
              if (rows.length) {
                const toInsert = rows.map(r => ({ ...r, role: 'admin' }))
                const insert = queryInterface.bulkInsert(
                  'seller_shop',
                  toInsert
                )
                resolve(insert)
              } else {
                resolve()
              }
            })
        })
      ])
    )
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([queryInterface.dropTable('seller_shop')])
    )
  }
}
