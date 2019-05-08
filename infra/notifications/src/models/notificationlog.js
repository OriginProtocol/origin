'use strict'

module.exports = (sequelize, DataTypes) => {
  const NotificationLog = sequelize.define(
    'NotificationLog',
    {
      messageFingerprint: { type: DataTypes.STRING(255), primaryKey: true },
      ethAddress: { type: DataTypes.STRING(255) },
      channel: { type: DataTypes.STRING(255) }
    },
    {
      tableName: 'notification_log'
    }
  )
  NotificationLog.associate = function() {
    // associations can be defined here
  }
  NotificationLog.beforeCreate(function(model, options) {
    console.log(`In beforeCreate()`)
    console.log(model)
    console.log(options)

    return new Promise ((resolve, reject) => {
      model.ethAddress = model.ethAddress.toLowerCase()
      return resolve(model, options)
    })

  })

  return NotificationLog
}
