'use strict';
const TableName = 'linked_session'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      linked_token_id: {
        type: Sequelize.INTEGER,
        onDelete: 'cascade',
        references: {
            model: 'linked_token',
            key: 'id'
          },
        allowNull:false
      },
      session_token: {
        type: Sequelize.STRING(255),
        allowNull:false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(TableName, ['session_token']));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName);
  }
};
