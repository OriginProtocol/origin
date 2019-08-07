const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')

/**
 * Returns grants for the authenticated user.
 */
router.get(
  '/api/grants',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    logger.debug('/api/grants', req.user.id)
    const grants = await Grant.findAll({ where: { userId: req.user.id } })
    res.json(grants.map(g => g.get({ plain: true })))
  })
)

module.exports = router
