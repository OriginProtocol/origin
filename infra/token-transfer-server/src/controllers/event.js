const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const { Event, Grant } = require('../models')

/**
 * Return the events pertaining to the user.
 */
router.get(
  '/api/events',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    // Perform an LEFT OUTER JOIN between Events and Grants. Neither SQLite nor
    // Sequelize supports this natively.
    const events = await Event.findAll({
      where: { email: req.session.email },
      order: [['id', 'DESC']]
    })
    const grantIds = Array.from(new Set(events.map(e => e.grantId)))
    const grants = await Grant.findAll({
      where: {
        id: { [Op.in]: grantIds },
        email: req.session.email // extra safeguard
      }
    })
    const grantsById = grants.reduce((map, grant) => {
      map[grant.id] = grant.get({ plain: true })
      return map
    }, {})
    // Populate each returned event with the corresponding grant.
    const returnedEvents = events.map(e => ({
      ...e.get({ plain: true }),
      grant: e.grantId ? grantsById[e.grantId] : null
    }))
    res.json(returnedEvents)
  })
)

module.exports = router
