'use strict';
module.exports = (sequelize, DataTypes) => {
  const LinkedSession = sequelize.define('LinkedSession', {
    sessionToken: DataTypes.STRING(255)
  }, {
    tableName:'linked_session'
  });
  LinkedSession.associate = function(models) {
    // associations can be defined here
    LinkedSession.belongsTo(models.LinkedToken, {onDelete: 'cascade'})
  };
  return LinkedSession;
};
