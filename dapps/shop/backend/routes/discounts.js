const { Sequelize, Discounts } = require('../data/db')

const { authenticated } = require('./_combinedAuth')
const { storeGate } = require('../utils/gates')

module.exports = function(app) {
  app.post('/check-discount', authenticated, storeGate, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: {
        [Sequelize.Op.and]: [
          { status: 'active' },
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('code')),
            Sequelize.fn('lower', req.body.code)
          )
        ],
        store_id: req.storeId
      }
    })

    if (discounts.length > 0) {
      const discount = discounts[0]
      res.json({
        code: discount.code,
        value: discount.value,
        discountType: discount.discountType
      })
      return
    }

    res.json({})
  })

  app.get('/discounts', authenticated, storeGate, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: { store_id: req.storeId },
      order: [['createdAt', 'desc']]
    })
    res.json(discounts)
  })

  app.get('/discounts/:id', authenticated, storeGate, async (req, res) => {
    const discount = await Discounts.findOne({
      where: {
        id: req.params.id,
        shop_id: req.shopId
      }
    })
    res.json(discount)
  })

  app.post('/discounts', authenticated, storeGate, async (req, res) => {
    const discount = await Discounts.create({
      store_id: req.storeId,
      ...req.body
    })
    res.json({ success: true, discount })
  })

  app.put('/discounts/:id', authenticated, storeGate, async (req, res) => {
    const discount = await Discounts.update(req.body, {
      where: {
        id: req.params.id,
        store_id: req.storeId
      }
    })

    res.json({ success: true, discount })
  })

  app.delete('/discounts/:id', authenticated, storeGate, async (req, res) => {
    const discount = await Discounts.destroy({
      where: {
        id: req.params.id,
        store_id: req.storeId
      }
    })
    res.json({ success: true, discount })
  })
}
