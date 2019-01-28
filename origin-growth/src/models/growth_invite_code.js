'use strict'

module.exports = (sequelize, DataTypes) => {
  const growth_invite_code = sequelize.define('growth_invite_code', {
    eth_address: DataTypes.STRING,
    code: DataTypes.STRING
  }, {})

  return growth_invite_code
}