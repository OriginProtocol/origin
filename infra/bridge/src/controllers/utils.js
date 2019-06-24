'use strict'

const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const Identity = require('@origin/identity/src/models').Identity

const { getExchangeRate } = require('../utils/exchange-rate')

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
    }
  })

  if (results.length === 0) {
    res.sendStatus(204)
  } else {
    res.sendStatus(200)
  }
  res.end()
})

/**
 * Returns ETH/USD excahnge rate
 */
router.get('/exchange-rate', async (req, res) => {
  res.send({
    price: await getExchangeRate()
  })
})

module.exports = router
