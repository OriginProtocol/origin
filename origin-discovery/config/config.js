module.exports = {
  development: {
    username: 'origin',
    password: 'origin',
    database: 'origin',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    define: {
      // Add the timestamp attributes (updatedAt, createdAt).
      timestamps: true,
      // Disable the modification of table names.
      freezeTableName: true,
      // Underscore style for field names.
      underscored: true
    }
  },
  test: {
    username: 'origin',
    password: 'origin',
    database: 'origin',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    define: {
      timestamps: true,
      freezeTableName: true,
      underscored: true
    }
  },
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    define: {
      timestamps: true,
      freezeTableName: true,
      underscored: true
    }
  }
}
