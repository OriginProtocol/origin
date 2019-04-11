module.exports = {
  development: {
    dialect: 'postgres',
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
  },
  test: {
    dialect: 'postgres',
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
  },
  production: {
    dialect: 'postgres',
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
