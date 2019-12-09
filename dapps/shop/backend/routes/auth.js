const auth = require('./_basicAuth')

module.exports = function(app) {
  app.get('/auth', auth, (req, res) => {
    res.json({ success: true })
  })
}
