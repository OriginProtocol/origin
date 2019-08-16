const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const { Event } = require('../models')

/**
 * Return the events pertaining to the user.
 */
router.get(
  '/events',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const query = { where: { userId: req.user.id }, order: [['created_at', 'DESC']] }
    if (req.query.action) {
      query.where.action = req.query.action
    }
    const events = await Event.findAll(query)
    res.json(events.map(event => event.get({ plain: true })))
  })
)

module.exports = router
