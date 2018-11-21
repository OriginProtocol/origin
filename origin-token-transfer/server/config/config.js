require('dotenv').config()

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './data/token-grants.sqlite3',
    define: {
      // Add the timestamp attributes (updatedAt, createdAt).
      timestamps: true,
      // Disable the modification of table names.
      freezeTableName: true,
      // Underscore style for field names.
      underscored: true
    },
    // Disable logging of SQL statements.
    logging: false
  },
  'test': {
    dialect: 'sqlite',
    storage: './data/test-token-grants.sqlite3',
    define: {
      // Add the timestamp attributes (updatedAt, createdAt).
      timestamps: true,
      // Disable the modification of table names.
      freezeTableName: true,
      // Underscore style for field names.
      underscored: true
    },
    // Disable logging of SQL statements.
    logging: false
  },
  'production': {
    use_env_variable: 'DATABASE_URL',
    define: {
      // Add the timestamp attributes (updatedAt, createdAt).
      timestamps: true,
      // Disable the modification of table names.
      freezeTableName: true,
      // Underscore style for field names.
      underscored: true
    },
    // Disable logging of SQL statements.
    logging: false
  }
}
