const { Sequelize, Discounts } = require('../data/db')

const { authenticated } = require('./_combinedAuth')
const { shopGate } = require('../utils/gates')

module.exports = function(app) {
  app.post('/check-discount', authenticated, shopGate, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: {
        [Sequelize.Op.and]: [
          { status: 'active' },
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('code')),
            Sequelize.fn('lower', req.body.code)
          )
        ],
        shopId: req.shopId
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

  app.get('/discounts', authenticated, shopGate, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: { shopId: req.shopId },
      order: [['createdAt', 'desc']]
    })
    res.json(discounts)
  })

  app.get('/discounts/:id', authenticated, shopGate, async (req, res) => {
    const discount = await Discounts.findOne({
      where: {
        id: req.params.id,
        shopId: req.shopId
      }
    })
    res.json(discount)
  })

  app.post('/discounts', authenticated, shopGate, async (req, res) => {
    const discount = await Discounts.create({
      shopId: req.shopId,
      ...req.body
    })
    res.json({ success: true, discount })
  })

  app.put('/discounts/:id', authenticated, shopGate, async (req, res) => {
    const result = await Discounts.update(req.body, {
      where: {
        id: req.params.id,
        shopId: req.shopId
      }
    })

    if (!result || result[0] < 1) {
      return res.json({ success: false })
    }

    const discount = await Discounts.findOne({
      where: {
        id: req.params.id,
        shopId: req.shopId
      }
    })

    res.json({ success: true, discount })
  })

  app.delete('/discounts/:id', authenticated, shopGate, async (req, res) => {
    const discount = await Discounts.destroy({
      where: {
        id: req.params.id,
        shopId: req.shopId
      }
    })
    res.json({ success: true, discount })
  })
}
