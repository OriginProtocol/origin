require('dotenv').config()

module.exports = function(req, res, next) {
  if (!req.session.email) {
    res.status(401).json({ success: false })
    return
  }
  next()
}
