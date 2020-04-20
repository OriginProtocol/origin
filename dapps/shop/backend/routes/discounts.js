const { Sequelize, Discount } = require('../models')
const { authShop, authSellerAndShop } = require('./_auth')

module.exports = function(app) {
  app.post('/check-discount', authShop, async (req, res) => {
    const code = req.body.code
    const discounts = await Discount.findAll({
      where: {
        [Sequelize.Op.and]: [
          { status: 'active' },
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('code')),
            Sequelize.fn('lower', code)
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
    const discounts = await Discount.findAll({
      where: { shopId: req.shop.id },
      order: [['createdAt', 'desc']]
    })
    res.json(discounts)
  })

  app.get('/discounts/:id', authSellerAndShop, async (req, res) => {
    const discount = await Discount.findOne({
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })
    res.json(discount)
  })

  app.post('/discounts', authSellerAndShop, async (req, res) => {
    const discount = await Discount.create({
      shopId: req.shop.id,
      ...req.body
    })
    res.json({ success: true, discount })
  })

  app.put('/discounts/:id', authSellerAndShop, async (req, res) => {
    const result = await Discount.update(req.body, {
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })

    if (!result || result[0] < 1) {
      return res.json({ success: false })
    }

    const discount = await Discount.findOne({
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })

    res.json({ success: true, discount })
  })

  app.delete('/discounts/:id', authSellerAndShop, async (req, res) => {
    const discount = await Discount.destroy({
      where: {
        id: req.params.id,
        shopId: req.shop.id
      }
    })
    res.json({ success: true, discount })
  })
}
