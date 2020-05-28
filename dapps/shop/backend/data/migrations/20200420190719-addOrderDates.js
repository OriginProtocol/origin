'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async () => {
      await queryInterface.addColumn('orders', 'created_at', {
        type: Sequelize.DATE
      })

      const orderQuery = `select order_id, created_block from orders where created_block is not null`
      const [orders] = await queryInterface.sequelize.query(orderQuery)

      const blockNums = orders.map(o => o.created_block)
      if (!blockNums.length) {
        return
      }
      const blockQuery = `select block_number, timestamp from events where block_number IN (${blockNums})`
      const [events] = await queryInterface.sequelize.query(blockQuery)

      for (const order of orders) {
        const event = events.find(e => e.block_number === order.created_block)
        await queryInterface.bulkUpdate(
          'orders',
          { created_at: new Date(Number(event.timestamp) * 1000) },
          { order_id: order.order_id }
        )
      }
    })
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(() =>
      Promise.all([queryInterface.removeColumn('orders', 'created_at')])
    )
  }
}
