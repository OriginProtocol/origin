const fetch = require('node-fetch')

const clientId = process.env.UPHOLD_CLIENT
const clientSecret = process.env.UPHOLD_SECRET

module.exports = function(app) {
  app.get('/uphold-auth', (req, res) => {
    const scopes = [
      'transactions:transfer:application',
      'transactions:transfer:others',
      'transactions:read',
      'user:read',
      'cards:read'
    ]
    const baseUri = `https://sandbox.uphold.com/authorize/${clientId}`
    res.redirect(`${baseUri}?scope=${scopes.join(' ')}&state=123`)
  })

  app.get('/uphold-response', async (req, res) => {
    const response = await fetch(
      'https://api-sandbox.uphold.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: [
          `client_id=${clientId}`,
          `client_secret=${clientSecret}`,
          'grant_type=authorization_code',
          `code=${req.query.code}`
        ].join('&')
      }
    )

    const body = await response.json()
    if (body.access_token) {
      req.session.upholdAccessToken = body.access_token
    }

    console.log(body)
    res.send('OK')
  })
}
