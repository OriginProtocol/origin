require('dotenv').config()
module.exports = {
    'development': {
      'use_env_variable':'DATABASE_URL',
      define: {
        freezeTableName: true,
        underscored: true
      }
    },
    'test': {
      'use_env_variable':'DATABASE_URL',
      define: {
        freezeTableName: true,
        underscored: true
      }
    },
    'production': {
      'use_env_variable':'DATABASE_URL',
      define: {
        freezeTableName: true,
        underscored: true
      }
    }
  }
