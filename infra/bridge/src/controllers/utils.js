'use strict'

const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const Identity = require('@origin/identity/src/models').Identity

const Log = require('../models/index').Log
const { getExchangeRate } = require('../utils/exchange-rate')

/* This method is used for determining if an email or phone has previously
 * been used to create an identity, and so is likely to be excluded from Origin
 * Rewards during fraud/duplicate detection.
 *
 * Returns 204 if the email or phone is fine, or 200 if it exists on another
 * account.
 */
router.post('/exists', async (req, res) => {
  const or = []
  if (req.body.email) {
    or.push({ email: req.body.email })
  }
  if (req.body.phone) {
    or.push({ phone: req.body.phone })
  }
  if (or.length === 0) {
    res.sendStatus(400).end()
    return
  }

  const results = await Identity.findAll({
    where: {
      [Op.or]: or
    },
    order: [['createdAt', 'ASC']]
  })

  if (results.length > 0 && req.body.ethAddress) {
    // If eth address is given and the first identity found ordered by created_at
    // is the given eth address then return 204
    const firstResult = results[0]
    if (
      firstResult.ethAddress.toLowerCase() === req.body.ethAddress.toLowerCase()
    ) {
      res.sendStatus(204)
    } else {
      res.sendStatus(200)
    }
  } else if (results.length === 0) {
    res.sendStatus(204)
  } else {
    res.sendStatus(200)
  }
  res.end()
})

/**
 * Returns exchange rate of given market
 */
router.get('/exchange-rate', async (req, res) => {
  res.send({
    price: await getExchangeRate(req.query.market)
  })
})

/**
 * Endpoint for the DApp to log events.
 */
router.post('/log', async (req, res) => {
  if (!req.body.data) {
    return res.status(400).send({ errors: ['Missing data'] })
  }

  await Log.create({
    data: req.body.data,
    ip: req.ip,
    headers: req.headers
  })

  return res.sendStatus(200)
})

module.exports = router
