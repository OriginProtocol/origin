const basicAuth = require('express-basic-auth')

module.exports = basicAuth({ users: { admin: process.env.ADMIN_PW } })
