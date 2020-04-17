require('dotenv').config()

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const db = {}

const SqliteURI = `sqlite:${__dirname}/../data/dshop.db`
const URI = process.env.DATABASE_URL || SqliteURI
const sequelize = new Sequelize(URI, {
  logging: false,
  underscored: true,
  timestamps: false
})

const isJs = file =>
  file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'

fs.readdirSync(__dirname)
  .filter(isJs)
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize
db.Op = Sequelize.Op

module.exports = db
