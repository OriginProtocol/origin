const bodyParser = require('body-parser')
const auth = require('./_basicAuth')

module.exports = function(app) {
  app.get('/auth', auth, (req, res) => {
    res.json({ success: true, email: req.session.email })
  })

  app.post('/auth/login', bodyParser.json(), (req, res) => {
    if (req.body.email && req.body.password === process.env.ADMIN_PW) {
      req.session.email = req.body.email
      res.json({ success: true, email: req.body.email })
    } else {
      res.json({ success: false })
    }
  })
}
