const { Sequelize, Discounts } = require('../data/db')

const auth = require('./_basicAuth')
const bodyParser = require('body-parser')

module.exports = function(app) {
  app.post('/check-discount', bodyParser.json(), async (req, res) => {
    const discounts = await Discounts.findAll({
      where: {
        [Sequelize.Op.and]: [
          { status: 'active' },
          Sequelize.where(
            Sequelize.fn('lower', Sequelize.col('code')),
            Sequelize.fn('lower', req.body.code)
          )
        ]
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

  app.get('/discounts', auth, async (req, res) => {
    const discounts = await Discounts.findAll({
      order: [['createdAt', 'desc']]
    })
    res.json(discounts)
  })

  app.get('/discounts/:id', auth, async (req, res) => {
    const discount = await Discounts.findOne({
      where: { id: req.params.id }
    })
    res.json(discount)
  })

  app.post('/discounts', auth, bodyParser.json(), async (req, res) => {
    const discount = await Discounts.create(req.body)
    res.json({ success: true, discount })
  })

  app.put('/discounts/:id', auth, bodyParser.json(), async (req, res) => {
    const discount = await Discounts.update(req.body, {
      where: { id: req.params.id }
    })

    res.json({ success: true, discount })
  })

  app.delete('/discounts/:id', auth, bodyParser.json(), async (req, res) => {
    const discount = await Discounts.destroy({ where: { id: req.params.id } })
    res.json({ success: true, discount })
  })
}
