const fetch = require('node-fetch')

const PrintfulURL = 'https://api.printful.com'

async function post(path, { auth, body }) {
  const res = await fetch(`${PrintfulURL}${path}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${auth}`
    },
    method: 'POST',
    body: JSON.stringify(body)
  })
  return await res.json()
}

async function get(path, { auth, apiKey }) {
  if (apiKey) {
    auth = Buffer.from(apiKey).toString('base64')
  }
  const res = await fetch(`${PrintfulURL}${path}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${auth}`
    },
    method: 'GET'
  })
  return await res.json()
}

module.exports = { post, get }
