module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME || 'origin',
    password: process.env.DATABASE_PASSWORD || 'origin',
    database: process.env.DATABASE_NAME || 'origin',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
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
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    define: {
      // Add the timestamp attributes (updatedAt, createdAt).
      timestamps: true,
      // Disable the modification of table names.
      freezeTableName: true,
      // Underscore style for field names.
      underscored: true
    }
  }
}
