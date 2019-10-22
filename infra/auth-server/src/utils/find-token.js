'use strict'

const { Sequelize, AuthToken } = require('../models')

const findAuthToken = async address => {
  // TODO: cache-hit

  // In case of cache-miss
  const tokens = await AuthToken.findAll({
    where: {
      ethAddress: address,
      revoked: false,
      expiresAt: {
        [Sequelize.Op.gt]: Date.now()
      }
    },
    limit: 5
  })

  // TODO: Set cache

  return
}

module.exports = findAuthToken
