const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const { Grant } = require('../models')

/**
 * Returns grants for the authenticated user.
 */
router.get(
  '/grants',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const grants = await Grant.findAll({ where: { userId: req.user.id } })
    res.json(grants.map(g => g.get({ plain: true })))
  })
)

module.exports = router
