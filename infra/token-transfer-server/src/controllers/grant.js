const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const { Grant } = require('../models')

const { vestedAmount } = require('../lib/vesting')

/**
 * Returns grants for the authenticated user.
 */
router.get(
  '/grants',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const grants = await Grant.findAll({ where: { userId: req.user.id } })
    res.json(
      grants.map(grant => {
        const plainGrant = grant.get({ plain: true })
        return {
          ...plainGrant,
          vestedAmount: vestedAmount(req.user, plainGrant)
        }
      })
    )
  })
)

module.exports = router
