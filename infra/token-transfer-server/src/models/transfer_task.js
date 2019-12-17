'use strict'

module.exports = (sequelize, DataTypes) => {
  const TransferTask = sequelize.define(
    'TransferTask',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      start: { type: DataTypes.DATE, allowNull: false },
      end: { type: DataTypes.DATE }
    },
    {
      tableName: 't3_transfer_task'
    }
  )

  return TransferTask
}
