const { Sequelize, Discounts } = require('../data/db')
const { authShop, authSellerAndShop } = require('./_auth')

module.exports = function(app) {
  app.post('/check-discount', authShop, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: {
        [Sequelize.Op.and]: [
          { status: 'active' },
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('code')),
            Sequelize.fn('lower', req.body.code)
          )
        ],
        shopId: req.shop.id
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

  app.get('/discounts', authSellerAndShop, async (req, res) => {
    const discounts = await Discounts.findAll({
      where: { shopId: req.shop.id },
      order: [['createdAt', 'desc']]
    })
    res.json(discounts)
  })

  app.get('/discounts/:id', authSellerAndShop, async (req, res) => {
    const discount = await Discounts.findOne({
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })
    res.json(discount)
  })

  app.post('/discounts', authSellerAndShop, async (req, res) => {
    const discount = await Discounts.create({
      shopId: req.shop.id,
      ...req.body
    })
    res.json({ success: true, discount })
  })

  app.put('/discounts/:id', authSellerAndShop, async (req, res) => {
    const result = await Discounts.update(req.body, {
      where: {
        id: req.params.id,
        shopId: req.shop.id
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

  app.delete('/discounts/:id', authSellerAndShop, async (req, res) => {
    const discount = await Discounts.destroy({
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })
    res.json({ success: true, discount })
  })
}
