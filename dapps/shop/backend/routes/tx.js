const { Events } = require('../data/db')
const { authSellerAndShop } = require('./_auth')

module.exports = function(app) {

  app.get('/events', authSellerAndShop, async (req, res) => {
    const events = await Events.findAll({
      where: { shopId: req.shop.id }
    })
    res.json(events)
  })

}
